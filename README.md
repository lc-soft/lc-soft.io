# lc-soft.io

lc-sft.io 网站源代码，基于 jekyll，纯静态页面。

## 搭建环境

安装必要依赖：

	sudo apt install build-essential nginx ruby ruby-dev python python-dev python-pip
	sudo gem install jekyll jekyll-paginate redcarpet pygments.rb compass
	pip install --upgrade pip
	sudo pip install setuptools flask uwsgi pygments

下载安装 nodejs 环境：

	cd ~
	mkdir tools
	wget https://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-x64.tar.xz
	xz -d node-v6.9.1-linux-x64.tar.xz
	tar -xvf node-v6.9.1-linux-x64.tar

将 nodejs 环境的 bin 目录添加到 PATH 环境变量中：

	sudo vim ~/.bashrc
	export PATH=$PATH:/home/liuchao/tools/node-v6.9.1-linux-x64/bin
	source ~/.bashrc

## 使用方法

用 git 下载代码库并进入目录中：

	git clone https://github.com/lc-soft/lc-soft.io.git
	cd lc-soft.io

用 npm 安装必要的依赖，然后运行 build.sh 脚本，完成页面生成相关的操作。

	npm install
	sh api/build.sh

## 注意事项

本代码库包含了主站、博客、LCUI 等站点的页面源代码，jekyll 在 _site 目录下会
创建对应文件夹（例如：www、blog、lcui）存放这些站点的页面。

如果希望每当向代码库推送提交的时候网站能够自动下载更新，请使用 uwsgi 运行 api
中的 flask 服务器：

	uwsgi --ini api/uwsgi.ini

然后，在 GitHub 中为你 fork 的项目配置 Webhooks，将地址指向 
`http://你的域名/build`。
