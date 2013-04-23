#!/usr/bin/env bash
#
# Script to initialize angular app

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
  "private": true,
  "dependencies": {
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
  app.listen(process.env.PORT);
EOF

npm install
