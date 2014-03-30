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

// Handle tildes
function resolvePath (string) {
  var resolved = string;
  if (string.substr(0,1) === '~') {
    resolved = process.env.HOME + string.substr(1);
  }
  return resolved;
}

function hasMetadata(filePath, callback) {
  var peekSize = 100; // size to read to detect separator
  fs.open(filePath,'r', function(err,fd) {
    if (err) {
      return callback(err);
    } else {
      var buffer = new Buffer(peekSize);
      fs.read(fd,buffer,0, peekSize,null, function(err, bytesRead, buffer) {
        fs.closeSync(fd);
        if (err) {
          return callback(err);
        } else {
          var match = buffer.toString().match(/^---\s*\n/);
          if (match && match.index === 0) {
            return callback(null, true);
          } else {
            return callback(null, false);
          }
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

    var secondMatch = ascii.match(/\n---\s*\n/);
    if (!secondMatch) {
      return callback(null,{} , ascii);
    }
    var secondSeparatorPos = secondMatch.index;
    var hasSecondSeparator = (secondSeparatorPos > 0);
    var firstSeparatorLength = separator.length; // TODO if separator has trailing spaces

    if (hasSecondSeparator) {
      var header = ascii.slice(firstSeparatorLength,secondSeparatorPos);
      var page = ascii.slice(secondSeparatorPos + secondMatch[0].length);

      var metadata;
      var error;
      try {
        metadata = yaml.safeLoad(header);
      } catch (e) {
        error = e;
      }
      if (error) {
        return callback(error);
      } else {
        return callback(null, metadata , page);
      }

    } else {
      return callback(null,{} , ascii);
    }
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

function getMetadata(filePath,options, callback) {
  var baseDir = resolvePath(options.baseDir);
  var resolvedFilePath = resolvePath(filePath);

  var url = path.join(path.sep,path.relative(path.dirname(resolvedFilePath), baseDir),path.basename(filePath));

  parse(filePath, function(err, rawMetadata) {

    if (err) {
      return callback(err);
    }

    if (typeof rawMetadata === 'string'){
      return callback(new Error('metadata needs to be a hash'));
    }

    var metadata = JSON.parse(JSON.stringify(rawMetadata));
    if (metadata) {
      metadata.url = url;
      if (!metadata.layout) {
        metadata.layout = 'default';
      }

      // Read Metadata of template
      var layoutPath = resolvePath(path.join(options.templateDir,metadata.layout + '.txt'));
      parse(layoutPath, function(err2, layoutMetadata) {
        if (err2) {
          return callback(err2);
        } else {
          var mergedMetadata = hashmerge(layoutMetadata,metadata);
          if (mergedMetadata.extension) {
            mergedMetadata.url = path.join(path.dirname(url), path.basename(url, path.extname(url)) + '.' + mergedMetadata.extension);
          }
          return callback(null,mergedMetadata);
        }
      });
    } else {
      return callback(err,metadata);
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
  var fullFilePath = resolvePath(filePath);
  var baseDir = resolvePath(options.baseDir);
  var yamlDirs = recurseDir(baseDir,fullFilePath);

  var context = {};

  async.each(yamlDirs, function(yamlDir, callback) {
    readYamlDir(fullFilePath,yamlDir,function(err,settings) {
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

var partials_cache = {};

function readPartials(baseDir, callback) {

  if (partials_cache[baseDir]) {
    return callback(null, partials_cache[baseDir]);
  }

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
    partials_cache[baseDir] = partials;
    callback(null, partials);
  });

}


function render(filePath,options, callback) {
  parse(filePath, function(err, rawMetadata, page) {
    if (err) {
      return callback(err);
    } else {
      getMetadata(filePath, options, function(err, metadata) {
      readYamls(filePath,options,function(err, settings) {
        var context = JSON.parse(JSON.stringify(settings));
        if (err) {
          return callback(err);
        } else {
          context.page = JSON.parse(JSON.stringify(metadata));
        }
        var renderedMarkdown = marked(page);
        var result;

        readPartials(resolvePath(options.baseDir), function(err, partials) {
          if (err) {
            return callback(err);
          } else {
            if (metadata && metadata.layout !== 'nil') {
              var extraPartials = JSON.parse(JSON.stringify(partials));
              extraPartials.content = renderedMarkdown;

              // Read template Content
              var layoutPath = resolvePath(path.join(options.templateDir,metadata.layout + '.txt'));

              parse(layoutPath, function(err, layoutMetadata, layoutContent) {
                result = mustache.render(layoutContent, context, extraPartials);
                return callback(null, result, context);
              });

            } else {
              result = mustache.render(renderedMarkdown, context, partials);
              return callback(null, result, context);
            }
          }
        });

      });
      });
    }
  });
}

function readBlogs(options, callback) {

  var walkOptions = {};
  var walker = walk.walk(options.baseDir, walkOptions);

  var blogMeta = [
  ];
  var blogFilter = 'blog_post';

  walker.on("file", function (root, fileStats, next) {
    var filename = fileStats.name;

    if (filename.indexOf('_') < 0) {
      var fullPath = path.join(root, filename);
      hasMetadata(fullPath, function(err, detected) {
        if (detected) {
          getMetadata(fullPath, options, function(err, metadata) {
            if (metadata[blogFilter]) {

              render(fullPath, options, function(err, content) {
                blogMeta.push( { metadata: metadata, content: content });
                next();

              });
            } else {
              next();
            }
          });
        } else {
          next() ;
        }
      });
    }else {
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
    return callback(null, blogMeta);
  });

}

// https://github.com/ajacksified/Mustache-RSS-Templates
function rss(options, callback) {
  var rssData = {
    Feed: {
      Title: options.title,
      Subtitle: options.subtitle,
      Link: options.url,
      Language: options.language,
      CopyrightInfo: options.copyright,
      Items: []
    }
  };

  //rss.Feed.PubData
  //rss.Feed.LastBuildDate

  readBlogs(options, function(err, posts) {
    var lastPosts = posts.slice(0,10);
    lastPosts.forEach(function(post) {
      var item = {
        Title: post.metadata.title,
        Content: post.content
        //Summary
        //Link: 
        //PubDate:
      };
      rssData.Feed.Items.push(item);
    });
    callback(null, rssData);
  });
}

module.exports = {
  hasMetadata: hasMetadata,
  getMetadata: getMetadata,
  parse: parse,
  readYamls: readYamls,
  readPartials: readPartials,
  readBlogs: readBlogs,
  render: render,
  recurseDir: recurseDir,
  rss: rss
};
