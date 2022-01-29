/*
 * nwebby
 * user/repo
 *
 * Copyright (c) 2014 Patrick Debois
 * Licensed under the MIT license.
 */
'use strict';
const { readBlogs } = require("./readBlogs");
var xmlescape = require('xml-escape');
var striptags = require('striptags');

 

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
    // Only top 50 posts
    var postPerRss = 50;
    var maxContentChars = 200;

    var lastPosts = posts.slice(0, postPerRss);
    lastPosts.forEach(function (post) {

      var item = {
        Title: post.metadata.title,
        Content: xmlescape(striptags(post.content)).slice(0,maxContentChars)+" ...",
        Summary: xmlescape(post.content),
        Link: xmlescape(post.metadata.url),
        PubDate: post.metadata.created_at
      };
      rssData.Feed.Items.push(item);
    });
    callback(null, rssData, posts);
  });
}
exports.rss = rss;
