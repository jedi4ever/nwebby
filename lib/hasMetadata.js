/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var fs = require('fs');

function hasMetadata(filePath, callback) {
  var peekSize = 500; // size to read to detect separator
  fs.open(filePath, 'r', function (err, fd) {
    if (err) {
      return callback(err);
    } else {
      var buffer = Buffer.alloc(peekSize);
      fs.read(fd, buffer, 0, peekSize, null, function (err, bytesRead, buffer) {
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
exports.hasMetadata = hasMetadata;
