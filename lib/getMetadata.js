/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var path = require('path');
var hashmerge = require('hashmerge');

const { resolvePath } = require("./util/resolvePath");
const { parse } = require("./parse");
const { duplicate } = require("./util/duplicate");


function getMetadata(filePath, options, callback) {
  var baseDir = resolvePath(options.baseDir);
  var resolvedFilePath = resolvePath(filePath);

  var url = path.join(path.sep, path.relative(baseDir, path.dirname(resolvedFilePath)), path.basename(filePath));

  parse(filePath, function (err, rawMetadata) {

    if (err) {
      return callback(err);
    }

    if (typeof rawMetadata !== 'object') {
      return callback(new Error('metadata needs to be a hash'));
    }

    if (rawMetadata) {
      var metadata = duplicate(rawMetadata);
      metadata.url = url;

      // Add the year as metadata
      if (metadata.created_at) {
        metadata.year = metadata.created_at.split("-")[0];
      }


      if (!metadata.layout) {
        metadata.layout = 'default';
      }

      if (metadata && metadata.layout === 'nil') {
        return callback(null, metadata);
      }

      // Read Metadata of template
      var layoutPath = resolvePath(path.join(options.templateDir, metadata.layout + '.txt'));
      parse(layoutPath, function (err2, layoutMetadata) {
        if (err2) {
          return callback(err2);
        } else {
          var mergedMetadata = hashmerge(layoutMetadata, metadata);
          if (mergedMetadata.extension) {
            mergedMetadata.url = path.join(path.dirname(url), path.basename(url, path.extname(url)) + '.' + mergedMetadata.extension);
          }
          mergedMetadata.url = mergedMetadata.url.replace(/\/index.html$/, '');
          return callback(null, mergedMetadata);
        }
      });
    } else {
      return callback(err, rawMetadata);
    }

  });
}
exports.getMetadata = getMetadata;
