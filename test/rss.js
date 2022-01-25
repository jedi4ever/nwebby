'use strict';

var expect = require('chai').expect;
var nwebby = require('..');
var path = require('path');

var fixturize = function(baseDir, filepath) {
  return {
    filename: path.join(__dirname, 'fixtures', baseDir, filepath),
    options: {
      baseDir: path.join(__dirname, 'fixtures', baseDir),
      templateDir: path.join(__dirname, 'fixtures', 'templates')
    }
  };
};

describe('Rss', function() {

  it('should find last 10 blogposts', function(done) {
    var fixture = fixturize('blogposts','variable_from_directory_yaml.txt');
    var options = fixture.options;
    options.url = "http://mysite.com";
    options.title = "My blog";
    options.subtitle = "is awesome";
    options.language = 'en';

    nwebby.rss(fixture.options, function(err,result) {
      expect(err).to.be.null;
      /*
      var expected = [
        { title: 'page'}
      ];
      */
      expect(result.Feed.Items.length).to.equal(2);
      return done();
    });
  });

});
