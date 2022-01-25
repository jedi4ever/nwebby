/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var walk = require('walk');
var path = require('path');
const { getMetadata } = require("./getMetadata");
const { hasMetadata } = require("./hasMetadata");

const { duplicate } = require("./util/duplicate");
const { resolvePath } = require("./util/resolvePath");

const { render } = require("./render");

function readBlogs(options, callback) {

  var blogOptions = duplicate(options);
  blogOptions.noLayout = true;

  var baseDir = resolvePath(options.baseDir);
  var walkOptions = {};
  var walker = walk.walk(baseDir, walkOptions);

  var blogMeta = [];
  var blogFilter = 'blog_post';

  walker.on("file", function (root, fileStats, next) {
    var filename = fileStats.name;

    if (filename.indexOf('_') < 0) {
      var fullPath = path.join(root, filename);
      hasMetadata(fullPath, function (err, detected) {
        if (detected) {
          getMetadata(fullPath, blogOptions, function (err, metadata) {
            if (metadata[blogFilter]) {

              render(fullPath, blogOptions, function (err, content) {
                blogMeta.push({ metadata: metadata, content: content });
                next();

              });
            } else {
              next();
            }
          });
        } else {
          next();
        }
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
    var blogMetaByDate = blogMeta.sort(function (a, b) {
      var d1 = new Date(a.metadata.created_at);
      var d2 = new Date(b.metadata.created_at);

      if (!a.metadata.created_at) {
        console.log("blogpost", a.metadata, "has no date");
      }
      if (!b.metadata.created_at) {
        console.log("blogpost", b.metadata, "has no date");
      }

      if (d1 < d2) { return 1; }
      if (d1 > d2) { return -1; }
      return 0;
    });
    return callback(null, blogMetaByDate);
  });

}

exports.readBlogs = readBlogs;