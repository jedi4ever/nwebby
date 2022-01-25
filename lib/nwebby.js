/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */

'use strict';

var { marked } = require('marked');

const { rss } = require("./rss");
const { getMetadata } = require("./getMetadata");
const { hasMetadata } = require("./hasMetadata");
const { readYamls } = require("./readYamls");
const { render } = require("./render");
const { readBlogs } = require("./readBlogs");
const { parse } = require("./parse");
const { readPartials } = require("./readPartials");

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

module.exports = {
  hasMetadata: hasMetadata,
  getMetadata: getMetadata,
  readYamls: readYamls,
  readPartials: readPartials,
  readBlogs: readBlogs,
  render: render,
  rss: rss
};
