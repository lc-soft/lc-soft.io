---
title: GitDigger 设计文档
repo: lc-soft/GitDigger
---

此文档主要记录了 GitDigger 的页面及功能的设计方案，内容较为零散，有待继续组织并完善。

## 产品简介

GitDigger 是一个为开源项目而生的社区，用于帮助开发者发现感兴趣的开源项目以及相关的新鲜事，让他们能够方便的了解到各个开源项目都有哪些需要解决的问题、有哪些问题是自己能够提供帮助的，以此为开源项目吸引更多的贡献者。

## 设计参考

- 掘金（https://juejin.im/）
- 知乎（https://www.zhihu.com/）
- 简书（http://www.jianshu.com/）
- GitHub（http://www.github.com/）
- Quora（https://quora.com/）
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

## 资源

### 图标

需要具有“挖掘”含义，可以是铲子、挖掘机，或者动物。

### 故事

故事包括：问题（Issue）、拉取请求（PullRequest）、发行版（Release）、评论（Comment），可以理解为新闻、趣事、资讯。

当 GitDigger 接收到 GitHub 发来的 Issue 事件时，如果该 Issue 所属的项目并未被收录，则忽略它。如果 Issue 的创建人在数据库里没有数据，则创建一个用户账号，账号归属于系统（System），账号主人可以认领它。

用户可以手动导入问题（Issue），该问题所属项目必须已被收录。

### 话题

话题用于组织和归类资源，资源包括项目、故事、开发者。

话题需要记录故事数、项目数、关注数、用户数。

### 项目

任何注册用户都可以注册项目信息，但注册后的项目处于待认领状态，如果该项目是 GitHub 上的项目，用户可凭已绑定的 GitHub 账号认领它，已被认领的项目会享受各种优先权。

项目的 LOGO 默认为作者头像，如果是未认领的项目，则使用默认 LOGO。

导入项目时，会自动导入它自带的话题，以及编程语言对应的话题。

项目删除后，相关动态也随之删除。

项目需要有一个主页，展示相关信息及动态。

### 项目质量

项目质量能影响到它本身以及相关故事的初始排名权重，主要影响因素如下：

- 是否有描述
- 是否有 README.md
- README.md 内容长度是否大于256个字节
- 是否有 LICENSE 文件
- commit 标题是否规范，长度是否大于8个字节，开头是否有 fix、add、remove、delete、close等动词，或格式类似于 [xxxx] add test，以及 xxxx: add test
- 是否有引入 Travis-CI 之类的自动化构建工具
- 是否有引入 Coveralls 之类的覆盖率测试工具
- 代码覆盖率是否超过 60%

### 项目活跃度

根据近期的提交记录、问题、拉取请求数量来计算，对于多个成员参与的项目，需要采用另一种计算方式，确保单人项目与多人项目的活跃度差距不会很大。

### 代码片段

代码片段从已收录的开源项目中收集，仅收集被 FIXME 注释标记的代码片段，这类代码片段是需要改进的，将它们展示出来可以帮助开源项目吸引贡献者。

注册用户可以对代码片段的复杂度评分，分数越高意味着代码越难被改进，满分 10 分，用 5 个级别难度标记：很容易、容易、普通、困难、很困难。代码片段的初始分数为 0，这样可以更容易吸引用户的注意，并促使用户纠正其评分。

用户可以按复杂度、编程语言筛选代码片段。

### 用户活跃度

根据近期的登录天数、投票数，以及向项目新增的提交记录、问题、拉取请求数量来计算。

### 用户声望值

数值化用户的影响力，根据用户的粉丝数、为他人项目提交的 issues 和 PR 数，以及自己项目的 star、fork、watch、issues、PR 数量计算，其中项目的 issues 和 PR 不包含作者自己创建的，计算规则大致如下：

    user.followers + user.issues * 6 + user.pull_requests * 12 + repo.stars + repo.watchers * 2 + repo.forks / 2 + repo.issues * 4 + repo.pull_requests * 8

后期可以添加支持绑定 StackOverflow、SegmentFault 账号，将用户在这些网站里的声望值按一定规则兑换为 GitDigger 的声望值。

### 积分

每日登录奖励 2 积分，用途如下：

- 对故事投票
- 导入新的故事
- 对代码片段的复杂度评分
- 临时提升自己项目的故事的排名

被投票的用户可从中获得十分之一的积分。

需要有积分历史记录。

### 排名

故事的排名权重根据时间（小时）、投票数、评论数、项目质量计算，计算方法参考 Hacker News 等相关网站。

## 页面设计

### 登录/注册

需要支持用 GitHub 账号登录和注册。邮箱验证和验证码可以在后期添加。

Product Hunt 只允许用第三方账号注册和登录，不用验证用户邮箱，看上去蛮方便的，省去了邮箱验证。

### 首页

按常规做法，首页都是用来综合展示网站内的各种信息资源的，而 GitDigger 可以展示的信息有：

- 话题：近期热门话题
- 开发者：按照近期活跃度，随机推荐几名开发者
- 项目：按照近期活跃度，随机推荐几个项目
- 问题：近期热门问题
- 动态：项目近期动态，包括推送代码、创建发行版、被 star/fork 等

未登录状态下，需要显示横幅（Banner），向用户简单描述此网站是干什么的。只显示文字内容的话未免有些枯燥，需要加上视觉元素和动画效果，参考对象有：

[![Flarum](/static/images/gitdigger/201708142103.png "Flarum")](/static/images/gitdigger/201708142103.png)

前期数据很少，各种规则还未成型，可以暂时不开发首页。

### 故事（Stories）

故事列表中每条故事需要展示的内容如下：

1. 出处，可以是：话题、用户、项目
2. XXX 干了什么，在什么时候
3. 标题
4. 摘要内容
5. 投票按钮，评论数

这是主要的展示方式，对于在项目页面里的故事列表，可以像知乎那样，当有评论时则将摘要内容替换为作者/成员/贡献者的评论，或 +1 数最多的评论。

故事需要支持条件筛选，条件包括时间、话题、热门。在用户未登录的情况下，默认列出整站的故事，登录后，如果用户有关注话题，则列出这些话题下的故事。

由于故事都是从 GitHub 上的开源项目中导入进来的，需要定时更新故事数据。对于已配置安装 GitDigger 应用的项目， GitHub 会在 Issue 有更新时通知 GitDigger，这里只需要响应并更新即可。

### Fixme

展示开源项目中待改进的代码片段。每个代码片段都有复杂度评级、注释，方便其他开发者知道自己是否能够修改以及如何正确修改它。

考虑到以后项目会很多，一个项目的代码片段要是占好几页的话会引起用户的反感，所以，列表中应该按项目分组列出代码片段。由于每个项目的代码片段展示位置只有一个，因此需要优先展示评分低且评分人数较多的代码片段，而且要是随机的，让其它代码片段得到更多的曝光机会。

为了能吸引开发者进入项目详情页了解更多代码片段，需要展示：

- 该项目的总片段数量
- 占比较高的复杂度等级，例如：有 80% 的代码片段的复杂度等级是普通

## 项目主页

需要展示的数据有：

- 名称
- 简介
- 项目成员及贡献者列表
- 近期开发动态
- 相关故事
- 代码片段
- 开源许可
- README.md 文档

可参考的对象有：

[![GitHub](/static/images/gitdigger/20170910191030.png "GitHub")](/static/images/gitdigger/20170910191030.png)

## 个人主页（Profile）

需要展示的数据有：

- 问题（Issues）
- 项目（Repositories）
- 拉取请求（PullRequests）
- 个人成就
  - 声望值
  - 获得的星星数量
  - 全国排名
  - 世界排名
  - 主要使用的编程语言
  - 各个编程语言的代码量
  - 近一年的编码量
- 关注的话题
- 近期动态
- 投票记录

可参考知乎、SegmentFault 的个人主页。

## 话题列表页（Topics）

列出所有话题，默认按活跃度排序，支持搜索，可参考 SegmentFault、StackOverflow 的标签列表页面。

### 话题主页

展示当前话题的基本资料，以及相关项目、开发者、故事、代码片段列表。

## 设置（Settings）

### GitHub

连接 GitHub 账号，安装 GitHub 应用。
