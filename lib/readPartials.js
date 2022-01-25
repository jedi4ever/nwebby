/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var fs = require('fs');
var walk = require('walk');
var path = require('path');

var partials_cache = {};

function readPartials(baseDir, callback) {

  if (partials_cache[baseDir]) {
    return callback(null, partials_cache[baseDir]);
  }

  var options = {};

  var walker = walk.walk(baseDir, options);

  var partials = {};

  walker.on("file", function (root, fileStats, next) {
    var filename = fileStats.name;

    if (filename.indexOf('_') === 0) {
      var fullPath = path.join(root, filename);
      fs.readFile(fullPath, 'utf-8', function (err, content) {
        var partialName = path.basename(filename, path.extname(filename));
        var cleanPartialName = partialName.slice(1);
        var dirPrefix = path.relative(baseDir, root);
        partials[path.join(path.sep, dirPrefix, cleanPartialName)] = content;
        next();
      });
    } else {
      next();
    }
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    next();
  });

  walker.on("directories", function (root, dirStatsArray, next) {
    // dirStatsArray is an array of `stat` objects with the additional attributes
    // * type
    // * error
    // * name
    next();
  });

  walker.on('end', function () {
    partials_cache[baseDir] = partials;
    callback(null, partials);
  });

}

function invalidatePartials() {
  partials_cache = {}
}

exports.readPartials = readPartials;
exports.invalidatePartials = invalidatePartials;
