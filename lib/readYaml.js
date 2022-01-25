/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var fs = require('fs');
var yaml = require('js-yaml');

function readYaml(filePath, callback) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    } else {
      var error;
      var settings;
      try {
        settings = yaml.safeLoad(data);
      } catch (e) {
        error = e;
      }
      if (error) {
        return callback(error);
      } else {
        return callback(null, settings);
      }
    }
  });
}

exports.readYaml = readYaml;
