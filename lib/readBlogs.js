/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var async = require('async');
const fg = require('fast-glob');

const { getMetadata } = require("./getMetadata");
const { hasMetadata } = require("./hasMetadata");
const { duplicate } = require("./util/duplicate");
const { resolvePath } = require("./util/resolvePath");

const { render } = require("./render");

const parallelLimit = 10;

function readBlogs(options, callback) {

  var baseDir = resolvePath(options.baseDir);
  // We assume only .txt are blog entries
  const entries = fg.sync(['**/index.txt','**/index.markdown','**/index.md', '**/index.html'], {cwd: baseDir, dot: true, absolute:true });

  var blogOptions = duplicate(options);
  blogOptions.noLayout = true;

  var blogMeta = [];
  var blogFilter = 'blog_post';

  var handleEntry = function handleEntry(fullPath, callback) {
    // Ignore all partials
      if ((fullPath.indexOf('_') < 0)) {
  
        // Check for metadata
       hasMetadata(fullPath, function (err, detected) {
  
          // If it has metadata
          if (detected) {
            getMetadata(fullPath, blogOptions, function (err, metadata) {
  
              // Only render files that are marked as blog_post
              if (metadata[blogFilter]) {
                render(fullPath, blogOptions, function (err, content) {
                  // Add metadata & content to blog metadata
                  blogMeta.push({ metadata: metadata, content: content, filename: fullPath });  
                  return callback(null);
                });
              } else {
                return callback(null);
              }
            });
          } else {
            return callback(null)
          }
        });
     } else {
       callback(null);
     } 
    };

  async.eachLimit(entries,parallelLimit,handleEntry, function(err) {

  // Return all entries in order of Date (using blogDataSorter helper)
  var blogMetaByDate = blogMeta.sort(blogDateSorter)
  return callback(null, blogMetaByDate);
  
  });



}

/* 
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
    console.log("====",filename);

    // Ignore all partials
    if ((filename.indexOf('_') < 0) && filename.endsWith(".222txt")) {
      console.log(filename);

      // Check for metadata
      var fullPath = path.join(root, filename);
      hasMetadata(fullPath, function (err, detected) {

        // If it has metadata
        if (detected) {
          getMetadata(fullPath, blogOptions, function (err, metadata) {

            // Only render files that are marked as blog_post
            if (metadata[blogFilter]) {

              render(fullPath, blogOptions, function (err, content) {

                // Add metadata & content to blog metadata
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
    // we ignore errors for now
    next();
  });

  walker.on("directories", function (root, dirStatsArray, next) {
    // dirStatsArray is an array of `stat` objects with the additional attributes
    // * type , // * error , // * name
    next();
  });

  walker.on('end', function () { 
    // Return all entries in order of Date (using blogDataSorter helper)
    var blogMetaByDate = blogMeta.sort(blogDateSorter)
    return callback(null, blogMetaByDate);
  });

} */

var blogDateSorter = function (a, b) {
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
};

exports.readBlogs = readBlogs;