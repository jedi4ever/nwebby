'use strict';

var expect = require('expect.js');
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

describe('Rendering', function() {
  it('with a page variable', function(done) {
    var fixture = fixturize('simple','variable_from_page.txt');
    nwebby.render(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.contain('Hello World');
      done();
    });
  });

  it('with a directory yaml variable', function(done) {
    var fixture = fixturize('simple','variable_from_directory_yaml.txt');
    nwebby.render(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.contain('sectionA');
      done();
    });
  });

  it('with a layout defined', function(done) {
    var fixture = fixturize('simple','file_with_layout_metadata.txt');
    nwebby.render(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.contain('Extension: html');
      done();
    });
  });

});
