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

const fs = require("fs");


marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});



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
          var tokens = marked.lexer(page);

          var newTokens = [];
          tokens.forEach(element => {
            if ((element.type == "code") && (element.lang)) {
              let newElement = element;

              const triggerField = 'file="@'
              let indexOfName = newElement.lang.indexOf(triggerField)
              // check for external files
              if ( indexOfName > 0) {

                const codeFile = newElement.lang.slice(indexOfName+ triggerField.length).split('"')[0];
                // parse filename
              //  const codeFile = "external.py"

              console.log("including code block")
          
                const newLocal = path.join(path.dirname(filePath), codeFile );
                newElement.text= fs.readFileSync(newLocal,"utf-8")
              }
              newTokens.push(newElement)
              
            } else {
              newTokens.push(element)
            }
          });


          let renderedMarkdown = marked.parser(newTokens);

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
