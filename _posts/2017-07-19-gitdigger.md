---
title: GitDigger 设计文档
repo: lc-soft/GitDigger
---

## 产品简介
GitDigger 是一个程序员社区，在这里你能从开源项目中挖掘有趣的故事，与其他人分享，让更多人能够知道开源项目、参与改进开源项目，促进开源项目的社区发展。

（文档有待完善）

## 需求及目标

作为普通开发者，平常无聊的时候会想看看其他人在干什么，长长见识，比如写了什么代码、都在讨论什么问题（Issue）、有哪些有意思的问题和问题评论、哪些项目发布了新版本等等。对于在某些领域有丰富经验的人，可能还会想知道哪些项目正遇到自己擅长领域的问题，看看自己能不能帮上忙。像 GitHub、Bitbucket、GitLab、Coding、码云这类代码平台都专注于源代码托管，用户的认知范围都仅限于自己的项目，没有提供多少途径让用户去发现其它用户和开源项目的动态。

作为开源项目作者或维护者，一个人的时间和精力都是有限的，有时会被一些琐碎的问题浪费很多时间，比如：各种小 bug，添加各种小功能。同类型的问题处理多了会很感到枯燥，但又不得不去做，做多了又会耽误主线任务开发进度，还会浪费动力。当遇到一些大点问题时，会希望有在这块领域的大佬来指点一二，比如：图形绘制算法如何优化、接口如何命名、Makefile 的正确使用方法、怎样写好 README.md、文档怎么组织等问题。自己搜索相关资料比较费时，可能会找不到答案，而去某些问答网站提问的话，需要写详尽的描述，还可能需要提供最小示例，比较麻烦也费时间，还很有可能得不到答案。这只是开发方面，对于普通开发者，不管项目的代码更新得有多频繁，也不会有人知道这个项目，除非主动去推广，通常的推广手段是在各大平台发布版本更新资讯，但持续时间有限，过了一两周又会回到无人问津的状态。

要解决上述问题，需要有个平台能够：

- 挖掘开源项目的各种信息，包括：问题（Issues）、拉取请求（Pull Requests）、评论、发行版（Releases），供用户浏览。
- 展示开源项目及相关的动态，让用户能够方便的找到活跃度高的项目，也能够通过最近动态了解到大家都在干什么。
- 支持让开源项目作者将一些问题（Issue）标记为“需要帮助”来获得更多的曝光，吸引更多有经验的人来向作者提供帮助。

## 运作原理

开源项目作者从 GitHub 导入项目后，GitDigger 会收集这些项目的相关内容和动态并展示出来，其他用户如果觉得这些内容有帮助，可以投票，得票数越高的内容排名越靠前，排名受时间影响，原理和 Hacker News 大致一样，每次投票消耗 1 积分，积分为 0 时不可投票，每日登录奖励 2 积分。

用户可以按话题（Topic）筛选感兴趣的内容，每个话题都有对应的主页，在这个主页可以找到相关的项目、开发者，以及各个项目的动态。

仓库和开发者都有一个主页，方便直接了解到他们的相关信息及近期动态。

## 技术

- 后端：Python、Flask、PostgreSQL、Celery、Redis
- 前端：Sass、CoffeeScript、Bootstrap、Webpack、Vue、jQuery
- 特性：响应式布局、多语言

原计划加入多语言支持，但考虑到目标用户群是全球的开发者，最终决定先都用纯英文文本，毕竟源代码是开放的，算是为其他人多留了个参与开源项目的机会吧。

## 设计参考

- 掘金（https://juejin.im/）
- 知乎（https://www.zhihu.com/）
- 简书（http://www.jianshu.com/）
- SegmentFault（https://segmentfault.com/）
- Designer News（https://www.designernews.co/）
- Ask Product Hunt（https://www.producthunt.com/）

## 技术文档

- [快速入门 — Flask-SQLAlchemy 2.0 documentation](http://www.pythondoc.com/flask-sqlalchemy/quickstart.html)
- [Using Flask Login · doobeh/scudbot Wiki](https://github.com/doobeh/scudbot/wiki/Using-Flask-Login)
- [Salted Passwords | Flask (A Python Microframework)](http://flask.pocoo.org/snippets/54/)
- [CSRF 保护 — Flask-WTF 0.9.5 documentation](http://www.pythondoc.com/flask-wtf/csrf.html)
- [GitHub-Flask — GitHub-Flask](https://github-flask.readthedocs.io/en/latest/)
- [Identifying users for GitHub Apps | GitHub Developer Guide](https://developer.github.com/apps/building-integrations/setting-up-and-registering-github-apps/identifying-users-for-github-apps/)
- [理解 Python 装饰器看这一篇就够了 - FooFish](https://foofish.net/python-decorator.html)
- [Cache — Werkzeug Documentation (0.12)](http://werkzeug.pocoo.org/docs/0.12/contrib/cache/)
- [webpack-contrib/expose-loader: expose loader module for webpack](https://github.com/webpack-contrib/expose-loader)
- [Developping a Flask Web App with a PostreSQL Database - Making all the Possible Errors - Theodo](Developping a Flask Web App with a PostreSQL Database - Making all the Possible Errors - Theodo)
- [Template Designer Documentation — Jinja2 Documentation (2.9)](http://jinja.pocoo.org/docs/2.9/templates/#builtin-filters)
- [Flask-RESTful — Flask-RESTful 0.2.1 documentation](http://flask-restful.readthedocs.io/en/0.3.5/index.html)
- [Flask-Restful POST fails due CSRF protection of Flask-WTF](https://stackoverflow.com/questions/21509728/flask-restful-post-fails-due-csrf-protection-of-flask-wtf#21509994)

## 功能设计

### 图标

需要具有“挖掘”含义，可以是铲子、挖掘机，或者动物。

### 故事

故事包括：问题（Issue）、拉取请求（PullRequest）、发行（Release）、评论（Comment），可以理解为新闻、趣事、资讯。

当 GitDigger 接收到 GitHub 发来的 Issue 事件时，如果该 Issue 所属的项目并未被收录，则忽略它。如果 Issue 的创建人在数据库里没有数据，则创建一个用户账号，账号归属于系统（System），账号主人可以认领它。

### 话题

话题用于组织和归类资源，资源包括项目、故事。

话题需要记录故事数、仓库数、关注数、用户数。

### 仓库

仓库的 LOGO 默认为作者头像。

仓库导入后允许所有者重建项目历史动态，包括 commits、releases、issues、pull requests。

导入仓库时，会自动导入它自带的话题，以及编程语言对应的话题。

仓库删除后，相关动态也随之删除。

仓库需要有一个主页，展示相关信息及动态。

### 仓库质量

仓库质量能影响到它本身以及相关故事的初始排名权重，主要影响因素如下：

- 是否有描述
- 是否有 README.md
- README.md 内容长度是否大于256个字节
- 是否有 LICENSE 文件
- commit 标题是否规范，长度是否大于8个字节，开头是否有 fix、add、remove、delete、close等动词，或格式类似于 [xxxx] add test，以及 xxxx: add test
- 是否有引入 Travis-CI 之类的自动化构建工具
- 是否有引入 Coveralls 之类的覆盖率测试工具
- 代码覆盖率是否超过 60%

### 仓库活跃度

根据近期的提交记录、问题、拉取请求数量来计算，对于多个成员参与的仓库，需要采用另一种计算方式，确保单人仓库与多人仓库的活跃度差距不会很大。

### 用户活跃度

根据近期的登录天数、投票数，以及向仓库新增的提交记录、问题、拉取请求数量来计算。

### 积分

每日登录奖励 2 积分，用途如下：

- 对故事投票
- 临时提升自己仓库的故事的排名

被投票的用户可从中获得十分之一的积分。

需要有积分历史记录。

### 排名

故事的排名权重根据时间（小时）、投票数、评论数、项目质量计算，计算方法参考 Hacker News 等相关网站。

## 页面设计

- 导航栏
    - 首页
    - 话题
    - 登录/注册
- [首页](#首页)
- [话题列表页（Topics）](#话题列表页)
    - [话题主页](#话题主页)
- [登录/注册（Sign in / Sign up）](#登录/注册)
- [个人主页（Profile）](#个人主页)
- 设置（Settings）
    - 基本资料（Profile）
    - 账户（Account）
    - GitHub
- 博客（Blog）

### 登录/注册

需要支持用 GitHub 账号登录和注册。邮箱验证和验证码可以在后期添加。

Product Hunt 只允许用第三方账号注册和登录，不用验证用户邮箱，看上去蛮方便的，省去了邮箱验证。

### 首页

未登录状态下,需要显示横幅（Banner），向用户简单描述此网站是干什么的。只显示文字内容的话未免有些枯燥，需要加上视觉元素和动画效果，参考对象有：

[![](/static/images/gitdigger/201708142103.png "Flarum")](/static/images/gitdigger/201708142103.png)


### 故事（Stories）

故事列表中每条故事需要展示的内容如下：

1. 出处，可以是：话题、用户、项目
2. XXX 干了什么，在什么时候
3. 标题
4. 摘要内容
5. 投票按钮，评论数

这是主要的展示方式，对于在项目页面里的故事列表，可以像知乎那样，当有评论时则将摘要内容替换为作者/成员/贡献者的评论，或 +1 数最多的评论。

效果参考对象有如下几个：

[![Google Plus](/static/images/gitdigger/20170804205312.png "Google Plus")](/static/images/gitdigger/20170804205312.png)

**Google Plus：**头部一行显示该内容所在的圈子，底部一行动态显示随机评论，可以作为参考。考虑到一般的问题（Issue）评论内容都比较长，要么就是长串文字描述，要么就是文字 + 代码片段，不太适合在底部展示，需要做些调整。

[![]Product Hunt(/static/images/gitdigger/20170804205345.png "Product Hunt")](/static/images/gitdigger/20170804205345.png)

**Product Hunt：**标签呈现方式比较独特，可以作为参考。

[![Designer News](/static/images/gitdigger/20170804205438.png "Designer News")](/static/images/gitdigger/20170804205438.png)

**Designer News：**链接有下划线，时间有点状下划线，视觉特征明显，容易分辨，细节设计蛮好的。

[![Flarum](/static/images/gitdigger/20170804205510.png "Flarum")](/static/images/gitdigger/20170804205510.png)

**Flarum：**头像右上角有小徽标，可以作为参考。

[![Quora](/static/images/gitdigger/20170804205540.png "Quora")](/static/images/gitdigger/20170804205540.png)

**Quora：**底部只有投票是按钮形式，其它都是文本形式。

综合上面的参考对象，初步确定了大致效果，如下图所示，头部区域包含作者头像、名称、仓库名、操作、时间，头像右下角小徽标表示当前故事类型及状态；中间内容区域包含标题和摘要；底部区域包括投票按钮、评论数量、主题列表。

[![GitDigger](/static/images/gitdigger/20170826195826.png "GitDigger")](/static/images/gitdigger/20170826195826.png)

故事需要支持条件筛选，条件包括时间、话题、热门。在用户未登录的情况下，默认列出整站的故事，登录后，如果用户有关注话题，则列出这些话题下的故事。

## 仓库主页

需要展示的数据有：

- 名称
- 简介
- 项目成员及贡献者列表
- 近期开发动态
- 相关故事
- 开源许可
- README.md 文档

可参考的对象有：

[![GitHub](/static/images/gitdigger/20170910191030.png "GitHub")](/static/images/gitdigger/20170910191030.png)

## 个人主页（Profile）

需要展示的数据有：

- 问题（Issues）
- 仓库（Repositories）
- 拉取请求（PullRequests）
- 个人成就
- 关注的话题
- 近期动态
- 投票记录

可参考知乎的个人主页。

## 话题列表页（Topics）

列出所有话题，默认按活跃度排序，支持搜索，可参考 SegmentFault、StackOverflow 的标签列表页面。

### 话题主页

展示当前话题的基本资料，以及相关仓库、开发者、故事列表。

## 设置（Settings）

### GitHub

连接 GitHub 账号，安装 GitHub 应用。
