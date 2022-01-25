/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var async = require('async');
var hashmerge = require('hashmerge');

const { readYamlDir } = require("./readYamlDir");
const { resolvePath } = require("./util/resolvePath");
const { recurseDir } = require("./util/recurseDir");


function readYamls(filePath, options, callback) {
  var fullFilePath = resolvePath(filePath);
  var baseDir = resolvePath(options.baseDir);
  var yamlDirs = recurseDir(baseDir, fullFilePath);

  var context = {};

  async.each(yamlDirs, function (yamlDir, callback) {
    readYamlDir(fullFilePath, yamlDir, function (err, settings) {
      var merged = hashmerge(context, settings);
      context = merged;
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }, function (err) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, context);
    }
  });

}
exports.readYamls = readYamls;
