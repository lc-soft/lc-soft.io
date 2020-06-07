---
title: 从 QuickJS 源码理解 JavaScript 的闭包
toc: true
categories:
  - 源码刨析
---

## 摘要

本文从 QuickJS 源码的角度分析 JavaScript 语言中的闭包的实现原理，首先介绍闭包的概念，然后从相关 C 语言代码，一步步解析闭包以及相关的垃圾回收机制的底层实现，最后总结闭包的定义和相关原理。

QuickJS 是一个用 C 语言编写的小型 JavaScript 引擎，支持 ES2019 规范，之所以选择 QuickJS 作为本文的解析对象，是因为它的源代码源码是由 C 语言编写的，仅由几个 C 文件组成，没有那么多复杂难懂的语法，也没有任何外部依赖，阅读难度较低。

注意，这不是一篇详细解析 QuickJS 源码的文章，作者仅对闭包相关的源码做了简单的解析，部分内容是在未完全理解 QuickJS 全部功能和工作原理的情况下而撰写的，某些概念和工作原理只适用于 QuickJS，可能具有误导性，请谨慎理解。
<!-- more -->

## 闭包是什么

估计很多人在初次被问到这问题时会将闭包理解为：能在其它地方访问的局部变量的集合、能访问父级作用域中的变量的函数、嵌套在函数中的函数，又或者就是函数，而 MDN 给的解释是：

> 函数和对其周围状态 **（lexical environment，词法环境）** 的引用捆绑在一起构成 **闭包（closure）**。也就是说，闭包可以让你从内部函数访问外部函数作用域。在 JavaScript 中，每当函数被创建，就会在函数生成时生成闭包。

## 闭包的形成

以 closure 为关键词进行搜索，第一个看到的是 `JSClosureVar` 结构体定义:

```c
typedef struct JSClosureVar {
    uint8_t is_local : 1;
    uint8_t is_arg : 1;
    uint8_t is_const : 1;
    uint8_t is_lexical : 1;
    uint8_t var_kind : 3; /* see JSVarKindEnum */
    /* 9 bits available */
    uint16_t var_idx; /* is_local = TRUE: index to a normal variable of the
                    parent function. otherwise: index to a closure
                    variable of the parent function */
    JSAtom var_name;
} JSClosureVar;
```

搜索 JSClosureVar 可看到它被用在 `JSFunctionBytecode` 和 `JSFunctionDef` 结构体中：

```c
typedef struct JSFunctionBytecode {
    ...

    JSAtom func_name;
    JSVarDef *vardefs; /* arguments + local variables (arg_count + var_count) (self pointer) */
    JSClosureVar *closure_var; /* list of variables in the closure (self pointer) */
    uint16_t arg_count;
    uint16_t var_count;
    uint16_t defined_arg_count; /* for length function property */
    uint16_t stack_size; /* maximum stack size */
    JSContext *realm; /* function realm */
    JSValue *cpool; /* constant pool (self pointer) */
    int cpool_count;
    int closure_var_count;
    ...
} JSFunctionBytecode;

...

typedef struct JSFunctionDef {
    JSContext *ctx;
    struct JSFunctionDef *parent;
    ...

    JSVarDef *vars;
    int var_size; /* allocated size for vars[] */
    int var_count;
    JSVarDef *args;

    ...

    /* list of variables in the closure */
    int closure_var_count;
    int closure_var_size;
    JSClosureVar *closure_var;

    ...
} JSFunctionDef;
```

从注释可知 `closure_var` 用于存放闭包中的变量，那么这些闭包变量会在什么时候添加呢？用 `closure_var` 进行搜索，可在 `add_closure_var()` 中找到对 `closure_var` 进行写操作的代码。

```c
static int add_closure_var(JSContext *ctx, JSFunctionDef *s,
                           BOOL is_local, BOOL is_arg,
                           int var_idx, JSAtom var_name,
                           BOOL is_const, BOOL is_lexical,
                           JSVarKindEnum var_kind)
{
    JSClosureVar *cv;

    /* the closure variable indexes are currently stored on 16 bits */
    if (s->closure_var_count >= JS_MAX_LOCAL_VARS) {
        JS_ThrowInternalError(ctx, "too many closure variables");
        return -1;
    }

    if (s->closure_var_count >= s->closure_var_size) {
        JSClosureVar *new_tab;
        int new_size;
        size_t slack;
        new_size = max_int(s->closure_var_count + 1,
                           s->closure_var_size * 3 / 2);
        new_tab = js_realloc2(ctx, s->closure_var,
                              new_size * sizeof(JSClosureVar), &slack);
        if (!new_tab)
            return -1;
        new_size += slack / sizeof(*new_tab);
        s->closure_var = new_tab;
        s->closure_var_size = new_size;
    }
    cv = &s->closure_var[s->closure_var_count++];
    cv->is_local = is_local;
    cv->is_arg = is_arg;
    cv->is_const = is_const;
    cv->is_lexical = is_lexical;
    cv->var_kind = var_kind;
    cv->var_idx = var_idx;
    cv->var_name = JS_DupAtom(ctx, var_name);
    return s->closure_var_count - 1;
}
```

`add_closure_var()` 将函数中用到的变量添加为闭包变量，在它的调用关系中，与闭包有直接关系的是 `get_closure_var2()`：

```c
/* 'fd' must be a parent of 's'. Create in 's' a closure referencing a
   local variable (is_local = TRUE) or a closure (is_local = FALSE) in
   'fd' */
static int get_closure_var2(JSContext *ctx, JSFunctionDef *s,
                            JSFunctionDef *fd, BOOL is_local,
                            BOOL is_arg, int var_idx, JSAtom var_name,
                            BOOL is_const, BOOL is_lexical,
                            JSVarKindEnum var_kind)
{
    int i;

    if (fd != s->parent) {
        var_idx = get_closure_var2(ctx, s->parent, fd, is_local,
                                   is_arg, var_idx, var_name,
                                   is_const, is_lexical, var_kind);
        if (var_idx < 0)
            return -1;
        is_local = FALSE;
    }
    for(i = 0; i < s->closure_var_count; i++) {
        JSClosureVar *cv = &s->closure_var[i];
        if (cv->var_idx == var_idx && cv->is_arg == is_arg &&
            cv->is_local == is_local)
            return i;
    }
    return add_closure_var(ctx, s, is_local, is_arg, var_idx, var_name,
                           is_const, is_lexical, var_kind);
}
```

在没有上下文的情况下只看 `get_closure_var2()` 的源码可能会难以理解它在干什么，为方便理解我们可以从 `resolve_scope_var()` 的源码来分析传入的 `s` 和 `fd` 参数有什么意义：

```c
/* return the position of the next opcode */
static int resolve_scope_var(JSContext *ctx, JSFunctionDef *s,
                             JSAtom var_name, int scope_level, int op,
                             DynBuf *bc, uint8_t *bc_buf,
                             LabelSlot *ls, int pos_next, int arg_valid)
{
    int idx, var_idx, is_put;
    int label_done;
    BOOL is_func_var = FALSE;
    JSFunctionDef *fd;
    JSVarDef *vd;

    ...

    /* resolve local scoped variables */
    var_idx = -1;
    for (idx = s->scopes[scope_level].first; idx >= 0;) {
        vd = &s->vars[idx];
        if (vd->var_name == var_name) {
            if (op == OP_scope_put_var || op == OP_scope_make_ref) {
                ...
            }
            var_idx = idx;
            break;
        }
        ...
        idx = vd->scope_next;
    }
    ...
    /* check parent scopes */
    for (fd = s; fd->parent;) {
        scope_level = fd->parent_scope_level;
        fd = fd->parent;
        ...
        for (idx = fd->scopes[scope_level].first; idx >= 0;) {
            vd = &fd->vars[idx];
            if (vd->var_name == var_name) {
                ...
                var_idx = idx;
                break;
            }
            ...
            idx = vd->scope_next;
        }
        if (var_idx >= 0)
            break;
        ...
    }
    ...
    if (var_idx >= 0) {
        /* find the corresponding closure variable */
        if (var_idx & ARGUMENT_VAR_OFFSET) {
            fd->args[var_idx - ARGUMENT_VAR_OFFSET].is_captured = 1;
            idx = get_closure_var(ctx, s, fd,
                                  TRUE, var_idx - ARGUMENT_VAR_OFFSET,
                                  var_name, FALSE, FALSE, JS_VAR_NORMAL);
        } else {
            fd->vars[var_idx].is_captured = 1;
            idx = get_closure_var(ctx, s, fd,
                                  FALSE, var_idx,
                                  var_name,
                                  fd->vars[var_idx].is_const,
                                  fd->vars[var_idx].is_lexical,
                                  fd->vars[var_idx].var_kind);
        }
        ...
    }
    ...
}
```

`resolve_scope_var()` 先会在局部变量中找目标变量，如果没有找到则向父级作用域遍历查找，在找到目标变量后，会调用 `get_closure_var()`，这时 `fd` 指向的是目标变量所在的父级函数定义，而 `s` 则是当前函数。

在分析完 `add_closure_var()` 的调用关系后我们可得出如下调用栈：

- `get_closure_var2()`: 向上递归直到目标父级函数为止，调用 `add_closure_var()` 给每一级函数添加闭包变量记录。
- `get_closure_var()`: 假定要找的变量是当前函数的局部变量，调用 `get_closure_var2()`。
- `resolve_scope_var()`：按变量名查找变量，如果未在局部作用域中找到，向上遍历作用域来查找变量，如果已找到则会标记该变量为已捕获，然后调用 `get_closure_var()` 获取该变量在闭包中的索引。
- `resolve_variables()`: 遍历操作码，在处理 `OP_scope_` 前缀的操作码时调用 `resolve_scope_var()`。
- `js_create_function()`: 根据函数定义创建一个函数对象，调用 `resolve_variables()`。

依赖关系图大致如下：

```text
                  add_closure_var()
                   /            \
                 /                \
               /               get_closure_var2()
             /               /                \
           /          get_closure_var()      resolve_scope_var()
         /                  |                   |
add_module_variables()   add_eval_variables()    resolve_variables()
        \                   |                 /
          \                 |               /
            \               |             /
                 js_create_function()
```

综上所述，在创建函数对象时，如果当前函数使用了父级函数中的局部变量，则该变量会被添加到父级函数对象中的闭包变量列表中。关于闭包的形成条件，相信大家在实际开发中已经隐约察觉到了，而这一节的源码解析似乎也没输出额外有用的东西，那么接下来我们再深入找些与闭包有关的代码来解析。

## 垃圾回收机制

由于闭包的存在，被闭包捕获的变量所占用的内存资源在函数执行完后不会被立刻回收，那么闭包是如何影响垃圾回收机制的？接下来我们通过相关源码来了解它的运作方式。

### 增加引用计数

对于涉及到内存资源分配的代码，我们可以用 gc 关键词搜索到 `add_gc_object()`：

```c
static void add_gc_object(JSRuntime *rt, JSGCObjectHeader *h,
                          JSGCObjectTypeEnum type)
{
    h->mark = 0;
    h->gc_obj_type = type;
    list_add_tail(&h->link, &rt->gc_obj_list);
}
```

它的调用关系如下：

- `close_var_refs()`
  - `async_func_free()`
  - `JS_CallInternal()`
- `close_lexical_var()`
  - `JS_CallInternal()`
- `js_create_function()`
- `js_async_function_call()`
- `js_create_module_var()`
- `JS_NewObjectFromShape()`
- `JS_ReadObjectRec()`
- `JS_NewContextRaw()`
- ...

从命名可以知道 `close_var_refs()` 是与变量引用相关的:

```c
static void close_var_refs(JSRuntime *rt, JSStackFrame *sf)
{
    struct list_head *el, *el1;
    JSVarRef *var_ref;
    int var_idx;

    list_for_each_safe(el, el1, &sf->var_ref_list) {
        var_ref = list_entry(el, JSVarRef, header.link);
        var_idx = var_ref->var_idx;
        if (var_ref->is_arg)
            var_ref->value = JS_DupValueRT(rt, sf->arg_buf[var_idx]);
        else
            var_ref->value = JS_DupValueRT(rt, sf->var_buf[var_idx]);
        var_ref->pvalue = &var_ref->value;
        /* the reference is no longer to a local variable */
        var_ref->is_detached = TRUE;
        add_gc_object(rt, &var_ref->header, JS_GC_OBJ_TYPE_VAR_REF);
    }
}

```

其中调用的 `JS_DupValueRT()` 的定义如下：

```c
static inline JSValue JS_DupValueRT(JSRuntime *rt, JSValueConst v)
{
    if (JS_VALUE_HAS_REF_COUNT(v)) {
        JSRefCountHeader *p = (JSRefCountHeader *)JS_VALUE_GET_PTR(v);
        p->ref_count++;
    }
    return (JSValue)v;
}
```

可以看出 `close_var_refs()` 会遍历栈帧中的变量引用列表，给每个变量引用所引用的值增加引用计数，然后将变量引用添加到 GC 对象列表中。搜索它的调用点可以在 `JS_CallInternal()` 的末尾找到它：

```c
/* argv[] is modified if (flags & JS_CALL_FLAG_COPY_ARGV) = 0. */
static JSValue JS_CallInternal(JSContext *caller_ctx, JSValueConst func_obj,
                               JSValueConst this_obj, JSValueConst new_target,
                               int argc, JSValue *argv, int flags)
{
    ...
    ret_val = JS_EXCEPTION;
    /* the local variables are freed by the caller in the generator
       case. Hence the label 'done' should never be reached in a
       generator function. */
    if (b->func_kind != JS_FUNC_NORMAL) {
    done_generator:
        sf->cur_pc = pc;
        sf->cur_sp = sp;
    } else {
    done:
        if (unlikely(!list_empty(&sf->var_ref_list))) {
            /* variable references reference the stack: must close them */
            close_var_refs(rt, sf);
        }
        /* free the local variables and stack */
        for(pval = local_buf; pval < sp; pval++) {
            JS_FreeValue(ctx, *pval);
        }
    }
    rt->current_stack_frame = sf->prev_frame;
    return ret_val;
}
```

`close_var_refs()` 上方的注释有说明它用于闭合栈对变量引用的引用，传入的 `sf->var_ref_list` 是变量引用列表，而 `sf` 是栈帧 (`JSStackFrame`)。

在 `JS_CallInternal()` 头部的可以找到栈帧的初始化代码：

```c
    ...
    sf->js_mode = b->js_mode;
    arg_buf = argv;
    sf->arg_count = argc;
    sf->cur_func = (JSValue)func_obj;
    init_list_head(&sf->var_ref_list);
    var_refs = p->u.func.var_refs;

    local_buf = alloca(alloca_size);
    if (unlikely(arg_allocated_size)) {
        int n = min_int(argc, b->arg_count);
        arg_buf = local_buf;
        for(i = 0; i < n; i++)
            arg_buf[i] = JS_DupValue(caller_ctx, argv[i]);
        for(; i < b->arg_count; i++)
            arg_buf[i] = JS_UNDEFINED;
        sf->arg_count = b->arg_count;
    }
    var_buf = local_buf + arg_allocated_size;
    sf->var_buf = var_buf;
    sf->arg_buf = arg_buf;

    for(i = 0; i < b->var_count; i++)
        var_buf[i] = JS_UNDEFINED;

    stack_buf = var_buf + b->var_count;
    sp = stack_buf;
    pc = b->byte_code_buf;
    sf->prev_frame = rt->current_stack_frame;
    rt->current_stack_frame = sf;
    ctx = b->realm; /* set the current realm */
    ...
```

这块代码做了这几件事：

- 初始化变量引用列表 (`sf->var_ref_list`)
- 增加参数的引用计数，初始化剩余参数的值为 undefined
- 初始化当前函数的局部变量值为 undefined
- 将栈缓存指向变量缓存末尾 (`stack_buf = var_buf + b->var_count`)
- 将当前栈帧 (`rt->current_stack_frame`) 记录为新栈帧的上一个栈帧 (`prev_frame`)
- 切换运行时环境的当前栈帧 (`rt->current_stack_frame`) 为新栈帧

从 `local_buf` 相关代码中可以看出 `local_buf` 包含参数列表和变量列表，其中参数列表在 `local_buf` 的头部，变量列表接在参数列表后面，剩余的部分用于存放后续创建的局部变量，它们的布局大致如下：

```text
┌───────────────────────────────┐
│ local_buf                     │
├─────────┬─────────┬───────────┤
│ arg_buf │ var_buf │ stack_buf │
└─────────┴─────────┴───────────┘
```

接下来找 `sf->var_ref_list` 写入代码，搜索 `var_ref_list` 可找到 `get_var_ref()` 对它有直接的写入操作：

```c
static JSVarRef *get_var_ref(JSContext *ctx, JSStackFrame *sf,
                             int var_idx, BOOL is_arg)
{
    JSVarRef *var_ref;
    struct list_head *el;

    list_for_each(el, &sf->var_ref_list) {
        var_ref = list_entry(el, JSVarRef, header.link);
        if (var_ref->var_idx == var_idx && var_ref->is_arg == is_arg) {
            var_ref->header.ref_count++;
            return var_ref;
        }
    }
    /* create a new one */
    var_ref = js_malloc(ctx, sizeof(JSVarRef));
    if (!var_ref)
        return NULL;
    var_ref->header.ref_count = 1;
    var_ref->is_detached = FALSE;
    var_ref->is_arg = is_arg;
    var_ref->var_idx = var_idx;
    list_add_tail(&var_ref->header.link, &sf->var_ref_list);
    if (is_arg)
        var_ref->pvalue = &sf->arg_buf[var_idx];
    else
        var_ref->pvalue = &sf->var_buf[var_idx];
    var_ref->value = JS_UNDEFINED;
    return var_ref;
}
```

代码很简单，如果 `sf->var_ref_list` 中已经有变量引用则直接增加其引用计数，否则新增一个变量引用然后追加到 `sf->var_ref_list` 中。接下来沿着 `get_var_ref()` 的调用关系往上找，可以找到与闭包有直接关系的 `js_closure2()` 函数:

```c
static JSValue js_closure2(JSContext *ctx, JSValue func_obj,
                           JSFunctionBytecode *b,
                           JSVarRef **cur_var_refs,
                           JSStackFrame *sf)
{
    JSObject *p;
    JSVarRef **var_refs;
    int i;

    p = JS_VALUE_GET_OBJ(func_obj);
    p->u.func.function_bytecode = b;
    p->u.func.home_object = NULL;
    p->u.func.var_refs = NULL;
    if (b->closure_var_count) {
        var_refs = js_mallocz(ctx, sizeof(var_refs[0]) * b->closure_var_count);
        if (!var_refs)
            goto fail;
        p->u.func.var_refs = var_refs;
        for(i = 0; i < b->closure_var_count; i++) {
            JSClosureVar *cv = &b->closure_var[i];
            JSVarRef *var_ref;
            if (cv->is_local) {
                /* reuse the existing variable reference if it already exists */
                var_ref = get_var_ref(ctx, sf, cv->var_idx, cv->is_arg);
                if (!var_ref)
                    goto fail;
            } else {
                var_ref = cur_var_refs[cv->var_idx];
                var_ref->header.ref_count++;
            }
            var_refs[i] = var_ref;
        }
    }
    return func_obj;
 fail:
    /* bfunc is freed when func_obj is freed */
    JS_FreeValue(ctx, func_obj);
    return JS_EXCEPTION;
}
```

从代码中可以看出，如果当前函数有闭包变量，则遍历 `b->closure_var` 列表，为每个闭包变量创建变量引用，然后将它们存放到函数对象的 `var_refs` 中。

`js_closure2()` 调用栈如下：

- `js_closure()`: 基于传入函数对象的函数字节码，创建一个新的函数对象，其原型指向与函数类型对应的原型，然后调用 `js_closure2()` 为新函数对象创建变量引用列表。
- `JS_CallInternal()`: 执行 `OP_fclosure` 和 `OP_fclosure8` 操作码对应的 `js_closure()`。

其中 `OP_fclosure` 操作码会在以下函数中添加：

- `resolve_variables()`: 执行 `OP_enter_scope` 操作码时，如果变量是函数声明或函数变量则向函数字节码缓存中写入 `OP_fclosure` 操作码。
- `js_parse_function_decl2()`: 解析完函数声明后，在父级函数定义中的常量池添加一个初始值为 null 的对象，然后写入 `OP_fclosure` 操作码和这个对象的索引。这个值为 null 的对象会在 `js_create_function()` 创建函数对象时赋值为对应的子函数对象。

结合上述内容可知，函数对象通过变量引用 (`JSVarRef`) 间接引用闭包变量，这些变量引用由父函数在执行时创建，然后存放在 `var_refs` 成员变量和当前栈帧的 `var_ref_list` 成员变量中，在父函数执行完时，当前栈帧引用的所有闭包变量的引用计数都会增加。

### 减少引用计数

引用计数的变量名是 `ref_count`，用它作为关键词可以搜索到以下几个函数：

```c
// quickjs.h

void __JS_FreeValue(JSContext *ctx, JSValue v);
static inline void JS_FreeValue(JSContext *ctx, JSValue v)
{
    if (JS_VALUE_HAS_REF_COUNT(v)) {
        JSRefCountHeader *p = (JSRefCountHeader *)JS_VALUE_GET_PTR(v);
        if (--p->ref_count <= 0) {
            __JS_FreeValue(ctx, v);
        }
    }
}
void __JS_FreeValueRT(JSRuntime *rt, JSValue v);
static inline void JS_FreeValueRT(JSRuntime *rt, JSValue v)
{
    if (JS_VALUE_HAS_REF_COUNT(v)) {
        JSRefCountHeader *p = (JSRefCountHeader *)JS_VALUE_GET_PTR(v);
        if (--p->ref_count <= 0) {
            __JS_FreeValueRT(rt, v);
        }
    }
}
```

```c
// quickjs.c

static void free_var_ref(JSRuntime *rt, JSVarRef *var_ref)
{
    if (var_ref) {
        assert(var_ref->header.ref_count > 0);
        if (--var_ref->header.ref_count == 0) {
            if (var_ref->is_detached) {
                JS_FreeValueRT(rt, var_ref->value);
                remove_gc_object(&var_ref->header);
            } else {
                list_del(&var_ref->header.link); /* still on the stack */
            }
            js_free_rt(rt, var_ref);
        }
    }
}
```

我们可以发现 `var_ref` 和 `var_ref->value` 都有引用计数，它们分别由 `free_var_ref()` 和 `JS_FreeValueRT()` 减少引用计数。当 `var_ref` 的引用计数减到 0 时，如果它在 GC 对象列表中则调用 `JS_FreeValueRT()` 释放它引用的值并移除 GC 对象。

先从 `free_var_ref()` 开始解析，在它的调用关系中最符合查找条件的是 `js_bytecode_function_finalizer()`：

```c
static void js_bytecode_function_finalizer(JSRuntime *rt, JSValue val)
{
    JSObject *p1, *p = JS_VALUE_GET_OBJ(val);
    JSFunctionBytecode *b;
    JSVarRef **var_refs;
    int i;

    p1 = p->u.func.home_object;
    if (p1) {
        JS_FreeValueRT(rt, JS_MKPTR(JS_TAG_OBJECT, p1));
    }
    b = p->u.func.function_bytecode;
    if (b) {
        var_refs = p->u.func.var_refs;
        if (var_refs) {
            for(i = 0; i < b->closure_var_count; i++)
                free_var_ref(rt, var_refs[i]);
            js_free_rt(rt, var_refs);
        }
        JS_FreeValueRT(rt, JS_MKPTR(JS_TAG_FUNCTION_BYTECODE, b));
    }
}
```

除了 `js_bytecode_function_finalizer()`，还有其他一些以 `_finalizer` 结尾的函数，它们都注册在 `js_std_class_def` 中：

```c
typedef struct JSClassShortDef {
    JSAtom class_name;
    JSClassFinalizer *finalizer;
    JSClassGCMark *gc_mark;
} JSClassShortDef;

static JSClassShortDef const js_std_class_def[] = {
    { JS_ATOM_Object, NULL, NULL },                             /* JS_CLASS_OBJECT */
    { JS_ATOM_Array, js_array_finalizer, js_array_mark },       /* JS_CLASS_ARRAY */
    { JS_ATOM_Error, js_object_data_finalizer, js_object_data_mark }, /* JS_CLASS_ERROR */
    { JS_ATOM_Number, js_object_data_finalizer, js_object_data_mark }, /* JS_CLASS_NUMBER */
    { JS_ATOM_String, js_object_data_finalizer, js_object_data_mark }, /* JS_CLASS_STRING */
    { JS_ATOM_Boolean, js_object_data_finalizer, js_object_data_mark }, /* JS_CLASS_BOOLEAN */
    { JS_ATOM_Symbol, js_object_data_finalizer, js_object_data_mark }, /* JS_CLASS_SYMBOL */
    { JS_ATOM_Arguments, js_array_finalizer, js_array_mark },   /* JS_CLASS_ARGUMENTS */
    ...
}
```

从命名可看出 `js_std_class_def` 包含了 JS 的一些标准类定义，它们会在 `JS_NewRuntime2()` 中被用于创建类对象，相关代码如下：

```c
    ...
    if (JS_InitAtoms(rt))
        goto fail;

    /* create the object, array and function classes */
    if (init_class_range(rt, js_std_class_def, JS_CLASS_OBJECT,
                         countof(js_std_class_def)) < 0)
        goto fail;
    rt->class_array[JS_CLASS_ARGUMENTS].exotic = &js_arguments_exotic_methods;
    rt->class_array[JS_CLASS_STRING].exotic = &js_string_exotic_methods;
    rt->class_array[JS_CLASS_MODULE_NS].exotic = &js_module_ns_exotic_methods;
    ...
```

由此可推测，在对象被释放时会调用对象所属类的 finalizer 方法，那么，可以用关键词 `.finalizer` 搜索到 `free_object()`：

```c
static void free_object(JSRuntime *rt, JSObject *p)
{
    int i;
    JSClassFinalizer *finalizer;
    JSShape *sh;
    JSShapeProperty *pr;

    p->free_mark = 1; /* used to tell the object is invalid when
                         freeing cycles */
    /* free all the fields */
    sh = p->shape;
    pr = get_shape_prop(sh);
    for(i = 0; i < sh->prop_count; i++) {
        free_property(rt, &p->prop[i], pr->flags);
        pr++;
    }
    js_free_rt(rt, p->prop);
    /* as an optimization we destroy the shape immediately without
       putting it in gc_zero_ref_count_list */
    js_free_shape(rt, sh);

    /* fail safe */
    p->shape = NULL;
    p->prop = NULL;

    if (unlikely(p->first_weak_ref)) {
        reset_weak_ref(rt, p);
    }

    finalizer = rt->class_array[p->class_id].finalizer;
    if (finalizer)
        (*finalizer)(rt, JS_MKPTR(JS_TAG_OBJECT, p));

    /* fail safe */
    p->class_id = 0;
    p->u.opaque = NULL;
    p->u.func.var_refs = NULL;
    p->u.func.home_object = NULL;

    remove_gc_object(&p->header);
    if (rt->gc_phase == JS_GC_PHASE_REMOVE_CYCLES && p->header.ref_count != 0) {
        list_add_tail(&p->header.link, &rt->gc_zero_ref_count_list);
    } else {
        js_free_rt(rt, p);
    }
}
```

`free_object()` 的调用栈：

- `free_object()`
- `free_gc_object()`
- `free_zero_refcount()`
- `__JS_FreeValueRT()`

我们可以发现上文中提到的 `__JS_FreeValueRT()` 正好在 `free_object()` 的调用栈中，那么接下来开始分析 `__JS_FreeValueRT()` 的调用关系。

`JS_CallInternal()` 在执行完函数后会调用 `close_var_refs()` 闭合调用栈对变量的引用，仔细看它的代码的话，可以发现在这之后会调用 `JS_FreeValue()` 释放栈帧中的局部变量：

```c
    ...
        /* free the local variables and stack */
        for(pval = local_buf; pval < sp; pval++) {
            JS_FreeValue(ctx, *pval);
        }
    }
    ...
```

`JS_FreeValue()` 减少引用计数后，如果为 0 则会调用 `__JS_FreeValue()`：

```c
void __JS_FreeValue(JSContext *ctx, JSValue v)
{
    __JS_FreeValueRT(ctx->rt, v);
}
```

### 释放内存资源

先看 `__JS_FreeValueRT()` 的源码：

```c
/* called with the ref_count of 'v' reaches zero. */
void __JS_FreeValueRT(JSRuntime *rt, JSValue v)
{
    uint32_t tag = JS_VALUE_GET_TAG(v);

    ...

    switch(tag) {
    case JS_TAG_STRING:
        {
            JSString *p = JS_VALUE_GET_STRING(v);
            if (p->atom_type) {
                JS_FreeAtomStruct(rt, p);
            } else {
#ifdef DUMP_LEAKS
                list_del(&p->link);
#endif
                js_free_rt(rt, p);
            }
        }
        break;
    case JS_TAG_OBJECT:
    case JS_TAG_FUNCTION_BYTECODE:
        {
            JSGCObjectHeader *p = JS_VALUE_GET_PTR(v);
            if (rt->gc_phase != JS_GC_PHASE_REMOVE_CYCLES) {
                list_del(&p->link);
                list_add(&p->link, &rt->gc_zero_ref_count_list);
                if (rt->gc_phase == JS_GC_PHASE_NONE) {
                    free_zero_refcount(rt);
                }
            }
        }
        break;
    case JS_TAG_MODULE:
        abort(); /* never freed here */
        break;
    ...
}
```

对于有 `JS_TAG_OBJECT` 或 `JS_TAG_FUNCTION_BYTECODE` 标记的值会被追加到 `gc_zero_ref_count_list` 中，然后在合适的时机调用 `free_zero_refcount()`：

```c
static void free_zero_refcount(JSRuntime *rt)
{
    struct list_head *el;
    JSGCObjectHeader *p;

    rt->gc_phase = JS_GC_PHASE_DECREF;
    for(;;) {
        el = rt->gc_zero_ref_count_list.next;
        if (el == &rt->gc_zero_ref_count_list)
            break;
        p = list_entry(el, JSGCObjectHeader, link);
        assert(p->ref_count == 0);
        free_gc_object(rt, p);
    }
    rt->gc_phase = JS_GC_PHASE_NONE;
}
```

与 GC 机制相关的 `rt->gc_phase` 共有三个值：

```c
typedef enum {
    JS_GC_PHASE_NONE,
    JS_GC_PHASE_DECREF,
    JS_GC_PHASE_REMOVE_CYCLES,
} JSGCPhaseEnum;
```

其中 `JS_GC_PHASE_REMOVE_CYCLES` 会在 `gc_free_cycles()` 中赋值给 `rt->gc_phase`，而 `gc_free_cycles()` 主要做了三件事：

- 处理 `rt->tmp_obj_list` 中的对象，将零引用计数的对象添加到 `rt->gc_zero_ref_count_list`
- 遍历 `rt->gc_zero_ref_count_list`，调用 `js_free_rt()` 释放它们占用的内存资源
- 初始化 `rt->gc_zero_ref_count_list`

它只在 `JS_RunGC()` 中被调用：

```c
void JS_RunGC(JSRuntime *rt)
{
    /* decrement the reference of the children of each object. mark =
       1 after this pass. */
    gc_decref(rt);

    /* keep the GC objects with a non zero refcount and their childs */
    gc_scan(rt);

    /* free the GC objects in a cycle */
    gc_free_cycles(rt);
}
```

`JS_RunGC()` 在 `JS_FreeRuntime()` 和 `js_trigger_gc()` 中被调用，从命名可知 `js_trigger_gc()` 就是我们要找的目标，它的代码如下：

```js
static void js_trigger_gc(JSRuntime *rt, size_t size)
{
    BOOL force_gc;
#ifdef FORCE_GC_AT_MALLOC
    force_gc = TRUE;
#else
    force_gc = ((rt->malloc_state.malloc_size + size) >
                rt->malloc_gc_threshold);
#endif
    if (force_gc) {
#ifdef DUMP_GC
        printf("GC: size=%" PRIu64 "\n",
               (uint64_t)rt->malloc_state.malloc_size);
#endif
        JS_RunGC(rt);
        rt->malloc_gc_threshold = rt->malloc_state.malloc_size +
            (rt->malloc_state.malloc_size >> 1);
    }
}
```

如果当前运行时环境已分配的内存大于阈值则会调用 `JS_RunGC()` 强制执行 GC。`js_trigger_gc()` 只被用在 `JS_NewObjectFromShape()` 中：

```c
static JSValue JS_NewObjectFromShape(JSContext *ctx, JSShape *sh, JSClassID class_id)
{
    JSObject *p;

    js_trigger_gc(ctx->rt, sizeof(JSObject));
    p = js_malloc(ctx, sizeof(JSObject));
    if (unlikely(!p))
        goto fail;
    p->class_id = class_id;
    ...
    switch(class_id) {
    case JS_CLASS_OBJECT:
        break;
    case JS_CLASS_ARRAY:
        ...
    }
    p->header.ref_count = 1;
    add_gc_object(ctx->rt, &p->header, JS_GC_OBJ_TYPE_JS_OBJECT);
    return JS_MKPTR(JS_TAG_OBJECT, p);
}
```

由此可知，在创建对象时会调用 `js_trigger_gc()` 触发 GC。

## 总结

在 QuickJS 的源码中，闭包是由带有父函数局部变量列表的函数在父函数执行时，通过增加这些变量的引用计数以阻止它们被 GC 回收而实现的，虽然闭包没有专用的数据结构定义，但函数的数据结构中都有包含闭包相关的数据定义，例如：函数定义 (`JSFunctionDef`) 中的闭包变量记录列表 (`closure_var`)，以及函数对象中的变量引用列表 (`func.var_refs`)。

结合这些数据结构的定义，如果仅将**变量引用**的集合定义为闭包的话并不准确，因为这些变量引用是在函数执行时创建的，保存在函数对象中，能被该函数对象访问，且会在函数对象被释放时一同释放，它们依赖于函数，而函数对象本身也和它们一样被其它地方引用，因此，闭包的定义应该包括函数，也就是：**函数**及**其依赖的变量的引用**的组合，这与 MDN 上的闭包定义 "函数和对其周围状态的引用捆绑在一起" 基本一致。

经过上述的源码解析，我们可以知道：

- QuickJS 的源码实现中有三种对象：值 (`JSValue`)、闭包变量记录 (`JSClosureVar`) 和变量引用 (`JSVarRef`)。
  - 值，是实例化后的对象，带有引用计数，像函数、数组、字符串等对象都是值。
  - 闭包变量记录，用于记录父函数作用域中的变量信息，包括索引、名称、是否为局部变量等。（为避免与下文的“闭包变量”混淆，这里使用"闭包变量记录"代替直译名称）
  - 变量引用，用于引用闭包中的值，带有引用计数，当引用计数为 0 时，它所引用的值的引用计数会减少。
- 函数的字节码对象都有一个闭包变量记录列表，用于记录它依赖的父级函数局部变量，这个记录操作不只是针对当前函数，从当前函数到目标函数经过的每一级函数都会有记录。
- 在函数执行时，如果函数内有子函数，则会基于子函数的字节码对象创建一个函数对象，然后将该对象保存到栈帧的局部变量列表中 (`stack_buf`)。这时，子函数的闭包变量记录列表会被转换成变量引用列表保存到函数对象中。
- 在函数执行完时，会先闭合栈帧对闭包变量的引用（也就是增加闭包变量的引用计数），然后释放栈帧中的局部变量。这时，如果子函数对象没有被其它地方引用就会被释放掉。
- 释放操作是先减少引用计数，直到引用计数减到 0 时才会执行释放操作，如果释放的对象是函数，则会释放它的变量引用列表，当变量引用的引用计数减到 0 时，它所引用的闭包变量的引用计数也会随之减少。
- QuickJS 的垃圾回收机制采用引用计数算法，引用计数为 0 的对象会被回收掉。
- 在创建对象时，如果当前已分配的内存超过阈值则会强制进行垃圾回收。

这么一说，只要函数依赖了全局变量或父函数的局部变量就会产生闭包，将函数返回给其它地方使用只是延长了闭包的生命周期而已，例如下面的代码，闭包在 `func()` 执行时产生，直到 `func()` 执行完时释放。

```js
function func() {
    const a = 1

    function add(b) {
        return a + b
    }

    add(2)
}

func()
```
