var nwebby = require('./nwebby');
var async = require('async');
var path = require('path');
var fs = require('fs');

const { rss } = require('./nwebby');

var async = require('async');
const fg = require('fast-glob');

function renderDir(srcDir, destDir, optRenderPattern) {
  let renderPattern = '**';
  if (optRenderPattern) {
    renderPattern= optRenderPattern
  } else {
    console.log("default render pattern: "+renderPattern)
  }

var rssOptions = {
  baseDir: path.join(srcDir, 'content/'),
  templateDir: path.join(srcDir, 'layout/')
};

var renderOptions = {
  baseDir: path.join(srcDir, 'content/'),
  templateDir: path.join(srcDir, 'layout/')
}

const entries = fg.sync([renderPattern], 
{ ignore: ['**/_*'], cwd: rssOptions.baseDir,
 dot: true, absolute: false, onlyFiles: true, markDirectories:true 
});

// First find only blog posts + render them to get the titles etc
//nwebby.readBlogs(blogOptions, function(err, blogMetadata) {
// console.log(blogMetadata);

// Next generate the RSS metadata from there
nwebby.rss(rssOptions, function (err, rssMetadata, blogMetadata) {

  // Pass metadata we found for the rendering process
  // Blogposts & RSS metadata
  let renderMetadata = {};
  renderMetadata.rss = rssMetadata;
  renderMetadata.blogposts = blogMetadata;
  renderOptions.metadata = renderMetadata;

  // Now loop over all files:
  // Render if it has metadata
  // Copy if no metadat
  // All while creating dirs if needed
  async.eachLimit(entries, 5, handleEntry, function (err) {
    console.log("done");
  })

})

// Helper to create dir if it does not exist
function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

var handleEntry = function handleEntry(filename, callback) {

  let fullFilePath = path.join(rssOptions.baseDir,filename);
  nwebby.hasMetadata(fullFilePath, function(err,metadataDetected){

    if (metadataDetected) {
      nwebby.render(fullFilePath, renderOptions, function(err, result, metadata) {
        if (err) {
          console.log(err);
          return callback(err);
        } else {
          var extension = metadata.page.extension;
          var destFile = path.join(destDir,filename);

          if (extension) {
         destFile = path.join(path.dirname(destFile),path.basename(destFile, path.extname(destFile))+'.'+extension);
          }

          console.log("[render]", destFile);
          ensureDirectoryExistence(destFile);

          fs.writeFileSync(destFile, result);

          return callback();
        }
      });
    } else {
      var destFile = path.join(destDir,filename);

      console.log("[copy]", destFile);
      ensureDirectoryExistence(destFile);
      fs.copyFileSync(fullFilePath, destFile);
      return callback();
    }

  
  } )

}

}

exports.renderDir = renderDir