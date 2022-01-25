/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
var fs = require('fs');
var yaml = require('js-yaml');
const { separator } = require("./util/const");

function parse(filePath, callback) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return callback(err);
    }
    var ascii = data.toString();

    var secondMatch = ascii.match(/\n---\s*\n/);
    if (!secondMatch) {
      return callback(null, {}, ascii);
    }
    var secondSeparatorPos = secondMatch.index;
    var hasSecondSeparator = (secondSeparatorPos > 0);
    var firstSeparatorLength = separator.length; // TODO if separator has trailing spaces

    if (hasSecondSeparator) {
      var header = ascii.slice(firstSeparatorLength, secondSeparatorPos);
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
        return callback(null, metadata, page);
      }

    } else {
      return callback(null, {}, ascii);
    }
  });
}

exports.parse = parse;