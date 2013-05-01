#!/usr/bin/env bash
#
# Script to initialize angular app

# @log startup time
START_SERVER_TEIM=$(date +%s)

npm install
grunt package

rm -rf app

# copy doc directory resolve symlinks
cp -Lr build/docs app

# copy javascript files
cp build/*.js app/
# copy home page
cp docs/src/templates/home.html app/
cd app

cat > "package.json" << EOF
{
  "name": "Angularjs",
  "description": "Angularjs documentation",
  "version": "0.0.1",
  "engines":{
    "node": "0.8.6",
    "npm": "1.2.x"
  },
  "private": true,
  "dependencies": {
    "npm": "1.2.x",
    "express": "3.x",
    "connect" : "2.x"
  }
}
EOF

cat > "main.js" << EOF
  var express = require('express');
  var connect = require('connect');
  var app = express();
  app.use(connect.compress());
  console.log(__dirname);
  app.use(express.static(__dirname + '/'));
  // HTML5 URL Support
  app.get('^(/|home\.html )$', function(req, res) {
    res.sendfile('home.html');
  });
  app.get('^\/?(guide|api|cookbook|misc|tutorial)(/)?*$', function(req, res) {
    res.sendfile('index.html');
  });
  var port = process.env.PORT || 80000;
  console.log('SERVER RUN ON PORT: ', port);
  app.listen(port);
EOF

npm install

END_SERVER_TEIM=$(date +%s)

# @log startup time
echo "SERVER START TIME: $((END_SERVER_TEIM - START_SERVER_TEIM))"

node main.js
