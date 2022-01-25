/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var fs = require('fs');
var async = require('async');
var path = require('path');
const { readYaml } = require("./readYaml");
const { duplicate } = require("./util/duplicate");

function readYamlDir(filePath, yamlDir, callback) {
  fs.readdir(yamlDir, function (err, filenames) {

    var yamlFiles = filenames.filter(function (f) {
      return (path.extname(f) === '.yaml' || path.extname(f) === '.yml');
    });

    var context = {};

    async.each(yamlFiles, function (yamlFile, callback) {
      readYaml(path.join(yamlDir, yamlFile), function (err, settings) {
        if (err) {
          return callback(err);
        } else {
          var basename = path.basename(yamlFile, path.extname(yamlFile));
          context[basename] = duplicate(settings);
          return callback(null);
        }
      });
    }, function (err) {
      if (err) {
        callback(err);
      } else {
        return callback(null, context);
      }
    });
  });
}
exports.readYamlDir = readYamlDir;
