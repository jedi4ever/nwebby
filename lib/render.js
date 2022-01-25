/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var { marked } = require('marked');
var mustache = require('mustache');
var path = require('path');
var hashmerge = require('hashmerge');
const { getMetadata } = require("./getMetadata");
const { readPartials} = require("./readPartials");

const { readYamls } = require("./readYamls");
const { duplicate} = require("./util/duplicate");
const { resolvePath } = require("./util/resolvePath");

const { parse} = require("./parse");

function render(filePath, options, callback) {
  parse(filePath, function (err, rawMetadata, page) {
    if (err) {
      return callback(err);
    } else {
      getMetadata(filePath, options, function (err, metadata) {

        readYamls(filePath, options, function (err, settings) {
          var context = duplicate(settings);
          if (err) {
            return callback(err);
          } else {
            context.page = duplicate(metadata);
          }
          var mergedContext = hashmerge(context, options.metadata);
          var renderedMarkdown = marked(page);
          var result;

          readPartials(resolvePath(options.baseDir), function (err, partials) {
            if (err) {
              return callback(err);
            } else {
              if (!options.noLayout && metadata && metadata.layout !== 'nil') {
                var extraPartials = duplicate(partials);
                extraPartials.content = renderedMarkdown;

                // Read template Content
                var layoutPath = resolvePath(path.join(options.templateDir, metadata.layout + '.txt'));

                parse(layoutPath, function (err, layoutMetadata, layoutContent) {
                  result = mustache.render(layoutContent, mergedContext, extraPartials);
                  return callback(null, result, mergedContext);
                });

              } else {
                result = mustache.render(renderedMarkdown, mergedContext, partials);
                return callback(null, result, mergedContext);
              }
            }
          });

        });
      });
    }
  });
}
exports.render = render;
