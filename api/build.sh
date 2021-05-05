#!/bin/sh
git pull origin master
cd _sass
compass compile
cd ..
git checkout package-lock.json
npm install
npm run build
python api/github.py lc-soft
python api/awards.py lc-soft
bundle exec jekyll build
