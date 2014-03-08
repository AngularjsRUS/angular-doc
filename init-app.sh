#!/usr/bin/env bash
#
# Script to initialize angular app
set -e

# @log startup time
START_SERVER_TEIM=$(date +%s)

rm -rf app

# copy doc directory
if [ "$APP_ENV" = "development" ]; then
  # save symlinks
  ln -s build/docs app
else
  # resolve symlinks
  cp -Lr build/docs app
fi

# copy javascript files
cp build/*.js app/

# copy img, javascript and other files for home page
cp -r home app/home

# copy home page
cp docs/src/templates/home.html app/
cd app

cat > "main.js" << EOF
  var express = require('express');
  var connect = require('connect');
  var app = express();
  app.use(connect.compress());
  console.log(__dirname);
  app.get('^(/|home\.html )$', function(req, res) {
    res.sendfile('home.html');
  });
  app.use(express.static(__dirname + '/'));
  // HTML5 URL Support
  app.get('^\/?(guide|api|cookbook|misc|tutorial|ui)(/)?*$', function(req, res) {
    res.sendfile('index.html');
  });
  var port = process.env.PORT || 8000;
  console.log('SERVER RUN ON PORT: ', port);
  app.listen(port);
EOF

END_SERVER_TEIM=$(date +%s)

# @log startup time
echo "SERVER START TIME: $((END_SERVER_TEIM - START_SERVER_TEIM))"

node main.js
