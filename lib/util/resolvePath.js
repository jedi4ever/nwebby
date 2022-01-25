/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
// Handle tildes
function resolvePath(string) {
  var resolved = string;
  if (string.substr(0, 1) === '~') {
    resolved = process.env.HOME + string.substr(1);
  }
  return resolved;
}

exports.resolvePath = resolvePath;