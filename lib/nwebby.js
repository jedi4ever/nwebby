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
var yaml = require('js-yaml');
var marked = require('marked');
var mustache = require('mustache');
var path = require('path');

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

var separator = '---\n';

function hasMetadata(filePath, callback) {
  fs.open(filePath,'r', function(err,fd) {
    if (err) {
      return callback(err);
    } else {
      var buffer = new Buffer(separator.length);
      fs.read(fd,buffer,0, separator.length,null, function(err, bytesRead, buffer) {
        if (err) {
          return callback(err);
        } else {
          var hasFirstSeparator = (buffer.toString() === separator);
          return callback(null, hasFirstSeparator);
        }
      });
    }
  });
}

function parse(filePath,callback) {
  fs.readFile(filePath,'utf8',function(err,data) {
    if (err) {
      return callback(err);
    }
    var ascii = data.toString();

    var secondSeparatorPos = (ascii.indexOf('\n' + separator ));
    var hasSecondSeparator = (secondSeparatorPos > 0);

    if (hasSecondSeparator) {
      var header = ascii.slice(separator.length,secondSeparatorPos);
      var page = ascii.slice(secondSeparatorPos + ('\n' + separator).length);

      var metadata;
      try {
        metadata = yaml.safeLoad(header);
        return callback(null, metadata , page);
      } catch (e) {
        return callback(e);
      }

    } else {
      return callback(null,{} , ascii);
    }
  });
}

function getMetadata(filePath,callback) {
  parse(filePath, function(err, metadata) {
    return callback(err,metadata);
  });
}

function readYaml(filePath, callback) {
  fs.readFile(filePath,'utf8',function(err,data) {
    if (err) {
      return callback(err);
    } else {
      var error;
      var settings;
      try {
        settings  = yaml.safeLoad(data);
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

function readYamls(filePath, options, callback) {
  var baseDir = path.resolve(options.baseDir);
  //var dirname = path.dirname(filePath);
  fs.readdir(baseDir, function(err,filenames) {

    var yamlFiles = filenames.filter(function(f) {
      return (path.extname(f) === '.yaml' || path.extname(f) === '.yml') ;
    });

    var context = {};

    async.each(yamlFiles, function (yamlFile,callback2) {
      readYaml(path.join(baseDir, yamlFile), function(err, settings) {
        if (err) {
          return callback2(err);
        } else {
          var basename = path.basename(yamlFile, path.extname(yamlFile));
          context[basename] = JSON.parse(JSON.stringify(settings));
          return callback2(null);
        }
      });
    } , function(err) {
      if (err) {
        callback(err);
      } else {
        return callback(null, context);
      }
    });
  });
}

function render(filePath,options, callback) {
  parse(filePath, function(err, metadata, page) {
    if (err) {
      return callback(err);
    } else {
      var context = {};
      context.page = JSON.parse(JSON.stringify(metadata));
      var renderedMarkdown = marked(page);
      var result = mustache.render(renderedMarkdown, context);
      return callback(null, result);
    }
  });
}

module.exports = {
  hasMetadata: hasMetadata,
  getMetadata: getMetadata,
  parse: parse,
  readYamls: readYamls,
  render: render
};
