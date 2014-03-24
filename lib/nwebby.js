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
var walk = require('walk');
var yaml = require('js-yaml');
var marked = require('marked');
var mustache = require('mustache');
var path = require('path');
var hashmerge = require('hashmerge');

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

function readYamlDir(filePath, yamlDir, callback) {
  fs.readdir(yamlDir, function(err,filenames) {

    var yamlFiles = filenames.filter(function(f) {
      return (path.extname(f) === '.yaml' || path.extname(f) === '.yml') ;
    });

    var context = {};

    async.each(yamlFiles, function (yamlFile,callback) {
      readYaml(path.join(yamlDir, yamlFile), function(err, settings) {
        if (err) {
          return callback(err);
        } else {
          var basename = path.basename(yamlFile, path.extname(yamlFile));
          context[basename] = JSON.parse(JSON.stringify(settings));
          return callback(null);
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

function recurseDir(baseDir, file) {
  if (baseDir === path.dirname(file) ) {
    return [ baseDir ];
  }

  var relDir = path.relative(baseDir,path.dirname(file));
  var dirs = [ baseDir];
  var dirParts = relDir.split(path.sep);

  dirParts.forEach(function(part) {
    dirs.push(path.join(dirs.slice(-1)[0],part));
  });
  return dirs;
}

function readYamls(filePath, options, callback) {
  var baseDir = path.resolve(options.baseDir);
  var yamlDirs = recurseDir(baseDir,filePath);

  var context = {};

  async.each(yamlDirs, function(yamlDir, callback) {
    readYamlDir(filePath,yamlDir,function(err,settings) {
      var merged = hashmerge(context,settings);
      context = merged;
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  }, function(err) {
    if (err) {
      return callback(err);
    } else {
      return callback(null,context);
    }
  });

}

function readPartials(baseDir, callback) {

  var options = {};

  var walker = walk.walk(baseDir, options);

  var partials = {
  };

  walker.on("file", function (root, fileStats, next) {
    var filename = fileStats.name;

    if (filename.indexOf('_') === 0) {
      var fullPath = path.join(root, filename);
      fs.readFile(fullPath, 'utf-8',function (err, content) {
        var partialName = path.basename(filename, path.extname(filename));
        var cleanPartialName = partialName.slice(1);
        var dirPrefix = path.relative(baseDir,root);
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

  walker.on('end', function() {
    callback(null, partials);
  });

}

function render(filePath,options, callback) {
  parse(filePath, function(err, metadata, page) {
    if (err) {
      return callback(err);
    } else {

      readYamls(filePath,options,function(err, settings) {
        var context = JSON.parse(JSON.stringify(settings));
        if (err) {
          return callback(err);
        } else {
          context.page = JSON.parse(JSON.stringify(metadata));
        }
        var renderedMarkdown = marked(page);
        var result;

        readPartials(options.baseDir, function(err, partials) {
          if (err) {
            return callback(err);
          } else {
          if (metadata && metadata.layout) {
            var template = fs.readFileSync(path.join(options.templateDir,metadata.layout + '.moustache'), 'utf-8');
            var extraPartials = JSON.parse(JSON.stringify(partials));
            extraPartials.content = renderedMarkdown;

            result = mustache.render(template, context, extraPartials);
          } else {
            result = mustache.render(renderedMarkdown, context, partials);
          }
          return callback(null, result);
          }
        });

      });
    }
  });
}


module.exports = {
  hasMetadata: hasMetadata,
  getMetadata: getMetadata,
  parse: parse,
  readYamls: readYamls,
  readPartials: readPartials,
  render: render,
  recurseDir: recurseDir
};
