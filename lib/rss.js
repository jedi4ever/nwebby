/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
const { readBlogs } = require("./readBlogs");

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
  readBlogs(options, function (err, posts) {
    var lastPosts = posts.slice(0, 10);
    lastPosts.forEach(function (post) {
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
exports.rss = rss;
