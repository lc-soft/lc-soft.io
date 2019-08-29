---
title: LCUI Router 0.1.0 开发日志
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
