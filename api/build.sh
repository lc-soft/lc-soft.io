#!/bin/sh
git pull origin master
cd _sass
compass compile
cd ..
webpack -p
python api/github.py lc-soft
python api/awards.py lc-soft
jekyll build
