#!/bin/sh
git pull origin master
cd _sass
compass compile
cd ..
webpack -p
jekyll build
