/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var path = require('path');

function recurseDir(baseDir, file) {
  if (baseDir === path.dirname(file)) {
    return [baseDir];
  }

  var relDir = path.relative(baseDir, path.dirname(file));
  var dirs = [baseDir];
  var dirParts = relDir.split(path.sep);

  dirParts.forEach(function (part) {
    dirs.push(path.join(dirs.slice(-1)[0], part));
  });
  return dirs;
}

exports.recurseDir = recurseDir;
