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

describe('BlogPosts', function() {

  it('should find all blogposts', function(done) {
    var fixture = fixturize('blogposts','variable_from_directory_yaml.txt');
    nwebby.readBlogs(fixture.options, function(err,result) {
      expect(err).to.be.null;

      // Should be sorted by last date, first

      // Blogposts don't render the default layout
      expect(result[0].content).not.to.contain('The default layout');
      
      // Find two blogposts
      expect(result.length).to.equal(2);
      return done();
    });
  });

});
