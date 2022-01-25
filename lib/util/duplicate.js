/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
function duplicate(data) {
  if (data === undefined) {
    return {};
  } else {
    return JSON.parse(JSON.stringify(data));
  }
}

exports.duplicate = duplicate;