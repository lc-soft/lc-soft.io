# lc-soft.io

lc-sft.io 网站源代码，基于 jekyll，纯静态页面。

## 搭建环境

安装必要依赖：

``` shell
sudo apt install build-essential nginx ruby ruby-dev python python-dev python-pip
sudo gem install jekyll jekyll-paginate redcarpet pygments.rb compass
pip install --upgrade pip
sudo pip install setuptools flask uwsgi pygments
```

下载安装 nodejs 环境：

``` shell
cd ~
mkdir tools
wget https://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-x64.tar.xz
xz -d node-v6.9.1-linux-x64.tar.xz
tar -xvf node-v6.9.1-linux-x64.tar
```

将 nodejs 环境的 bin 目录添加到 PATH 环境变量中：

``` shell
sudo vim /etc/profile
export PATH=$PATH:/home/liuchao/tools/node-v6.9.1-linux-x64/bin
source /etc/profile
```

之后用 git 下载代码库并进入目录中：

``` shell
git clone https://github.com/lc-soft/lc-soft.io.git
cd lc-soft.io
```

用 npm 安装必要的依赖，然后运行 update.sh 脚本，完成页面生成相关的操作。

``` shell
npm install
sh api/update.sh
```
