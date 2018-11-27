#!/bin/sh
git pull origin master
cd _sass
compass compile
cd ..
npm install
npm run build
python api/github.py lc-soft
python api/awards.py lc-soft
jekyll build
