/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */

'use strict';

const { rss } = require("./rss");
const { getMetadata } = require("./getMetadata");
const { hasMetadata } = require("./hasMetadata");
const { readYamls } = require("./readYamls");
const { render } = require("./render");
const { readBlogs } = require("./readBlogs");
const { readPartials } = require("./readPartials");

module.exports = {
  hasMetadata: hasMetadata,
  getMetadata: getMetadata,
  readYamls: readYamls,
  readPartials: readPartials,
  readBlogs: readBlogs,
  render: render,
  rss: rss
};
