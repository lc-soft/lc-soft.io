---
title: LCUI Router 0.1.0 开发日志
categories:
  - 开发日志
  - LCUIRouter
---

一个应用的图形界面通常会包含很多个视图，视图切换和导航是很常用的功能，然而在 LCUI 中实现这些功能却非常麻烦，考虑到这些问题，需要一个像 [Vue Router](https://router.vuejs.org/zh/) 的路由解决方案，主要功能下：

- 嵌套的路由/视图表
- 模块化的、基于组件的路由配置
- 路由参数、查询、通配符
- 细粒度的导航控制
- 带有自动激活的 CSS class 的链接

这些功能虽然是直接照搬 Vue Router 文档中的功能说明，但也确实是 LCUI 应用所需要的功能。

一开始是打算从 0 开始写的，花了些时间写了大致的伪代码，包括路由匹配、参数解析、router-link、router-view 的实现，但后来感觉路由匹配功能的代码写得很烂，于是就以“学习前端开源项目的源码”为由而去参考 Vue Router 中的路由匹配相关的代码。

Vue Router 的初始化流程如下：

- 调用 createMatcher() 创建一个路由匹配器，并将路由配置传给它。
- createMatcher() 会调用 createRouteMap() 创建路由映射，该函数返回三个对象：pathList, pathMap, nameMap，由名称可知它们分别是路径列表、路径映射表、名称映射表。
- createRouteMap() 会遍历路由配置并调用 addRouteRecord() 将路由配置转换为 RouteRecord 类型对象
- addRouteRecord() 做了这几件事：
  - 构建 RouteRecord 类型的 record 对象
  - 将 record.path 追加到 pathList
  - record 添加到 pathMap 中，以 record.path 为索引（key）
  - 如果 record.name 有效，则将 record 添加到 nameMap 中，以 record.name 为索引（key）
  - 注册别名（alias）

路由匹配流程如下：

- 调用 normalizeLocation() 将 RawLocation 类型的 raw 对象转换为 Location 类型对象，该函数做了以下事情：
  - 如果 raw 对象是字符串，则创建 Location 类型对象并将 raw 赋值给它的 path 属性
  - 解析 params、query 和 hash
- 如果有指定路由名称，则直接从 nameMap 中获取路由记录，然后补全 location 中的 params 和 path 属性并交给 _createRoute() 函数来创建 Route 类型对象
- 如果有指定路径，则遍历 pathList 列表查找匹配的路由记录

## 2020-01-04

补充了 history 相关接口的单元测试，测试覆盖率提升至 89%。

## 2020-01-03

完成了前进/后退/主页按钮的导航功能，以及起始页、关于页面。

## 2020-01-02

Chrome 浏览器的选项卡有分割线，要在 LCUI 中实现的话，可给每个选项卡添加左右两个分割线，选项卡右外间距 (margin-right) 设为 -1px，在选项卡 hover 或 active 时将 z-index 设置为 1，这样就能用背景遮住相邻选项卡的分割线。

完成了标签页关闭、新建页按钮。

## 2020-01-01

完成了选项卡栏、导航栏、欢迎页面。

有几个布局相关的问题：

- 选项卡宽度过小时，图标和标题会自动换行，在网页中可以用 `white-space: nowrap` 禁止换行，但在 LCUI 中 `white-space` 是文字的专属样式，不能作用在部件的布局上。
- 输入框宽度应自动填满剩余空间。
- 内容区域高度应铺满剩余空间。

看样子需要让 LCUI 支持 flex 布局才能解决它们。

## 2019-12-30

选项卡用 router-link 实现的话，页面没法预加载，只能在点击选项卡时才会加载页面，因为这些页面都公用同一个 router-view，所以，还是改成常规的实现方法吧。

## 2019-12-29

示例应用有两个路由配置，但 LCUI CLI 目前只支持一个配置文件，需要调整配置文件内容格式和生成的代码。

## 2019-12-16

选项卡栏中的选项卡和帧分别可以用 `<router-link>` 和 `<router-view>` 实现。

帧用于容纳所有标签页，这些标签页以 id 作为索引键，将帧与 `/frame/:id` 路由绑定后，每当点击选项卡导航到 `/frame/1` 这样的地址时，就会找到对应的标签页并显示它。

每个标签页都有独立的导航栏，这意味着要给每个标签页创建一个 router 实例。

标签页中的内容区用 `<router-view>` 呈现，可预置以下几个页面：

- **welcome:** 欢迎页面
- **about:** 关于页面，展示程序名称、版本号等信息
- **file:** 文件页面，简单的文件浏览器，效果可参考用网页浏览器打开 `file:///C:/` 效果

## 2019-12-15

准备开发一个用于展示 LCUI Router 功能的示例应用，从 LCUI Router 现有的功能来看，浏览器最适合作为示例应用。

首先设计界面结构：

- 主窗口
  - 选项卡栏
  - 帧
    - 导航栏
      - 前进、后退、刷新、主页
      - 地址栏
      - 选项菜单
        - 打开新的标签页
        - 历史纪录
        - 缩放
        - 关于
    - 内容区

按照惯例，第一个版本只实现基本功能，那么先砍掉选项菜单按钮，改用“关于”按钮代替。

## 2019-12-07

Vue Router 的 router-link 组件的 to 参数可以传字符串和对象，例如：`"path/to/file"` 和 `{ name: 'users', params: { id: 123 } }`，在 LCUI Router 要支持这种传参方式的话得实现一个解析器，从目前的情况看来还没必要浪费时间去做，所以 router-link 组件只支持字符串参数够了。

path 和 name 是常用的参数，有点纠结参数命名，目前决定采用以下命名：

- to -> path
- route-name -> name
