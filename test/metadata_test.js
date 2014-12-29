'use strict';

var expect = require('expect.js');
var nwebby = require('..');
var path = require('path');

var fullPath = function(filepath) {
  return path.join(__dirname, 'fixtures', filepath);
};
var options = {
  baseDir: path.join(__dirname,'fixtures'),
  templateDir: path.join(__dirname, 'fixtures', 'templates')
};

var fixturize = function(baseDir, filepath) {
  return {
    filename: path.join(__dirname, 'fixtures', baseDir, filepath),
    options: {
      baseDir: path.join(__dirname, 'fixtures', baseDir),
      templateDir: path.join(__dirname, 'fixtures', 'templates')
    }
  };
};

describe('Metadata Detection', function() {
  it('should error on a non-existing file', function(done) {
    var filename = fullPath('non-existing-file.txt');
    nwebby.getMetadata(filename,options,function(err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  it('should detect on file_with_metadata.txt', function(done) {
    var filename = fullPath('file_with_metadata.txt');
    nwebby.getMetadata(filename,options, function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({
        layout: 'default',
        title: 'hello',
        url: '/file_with_metadata.txt'
      });
      done();
    });
  });

  it('should not detect on file_without_metadata.txt', function(done) {
    var filename = fullPath('file_without_metadata.txt');
    nwebby.getMetadata(filename,options, function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({ 
        layout: 'default',
        url: '/file_without_metadata.txt' 
      });
      done();
    });
  });

  it('should not detect on file_with_partial_metadata.txt', function(done) {
    var filename = fullPath('file_with_partial_metadata.txt');
    nwebby.getMetadata(filename,options, function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({
        layout: 'default',
        url: '/file_with_partial_metadata.txt'
      });
      done();
    });
  });

  it('should not detect on file_with_separator_not_in_beginning.txt', function(done) {
    var filename = fullPath('file_with_separator_not_in_beginning.txt');
    nwebby.getMetadata(filename,options, function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({
        layout: 'default',
        url: '/file_with_separator_not_in_beginning.txt'
      });
      done();
    });
  });

  it('should not error on file_with_unfinished_field.txt', function(done) {
    var filename = fullPath('file_with_unfinished_field.txt');
    nwebby.getMetadata(filename,options,function(err,metadata) {
      expect(err).not.to.be(null);
      expect(metadata).to.be(undefined);
      done();
    });
  });

  it('should detect metadata file_with_separator+trailingspaces', function(done) {
    var filename = fullPath('file_with_separator+trailingspaces.txt');
    nwebby.hasMetadata(filename,function(err,detectedMetadata) {
      expect(err).to.be(null);
      expect(detectedMetadata).to.be(true);
      done();
    });
  });

  it('should not error on file_with_separator+trailingspaces', function(done) {
    var filename = fullPath('file_with_separator+trailingspaces.txt');
    nwebby.getMetadata(filename,options, function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata.title).to.be('bla');
      done();
    });
  });

  it('should not error on file_with_layout_metadata', function(done) {
    var fixture = fixturize('simple','file_with_layout_metadata.txt');
    nwebby.getMetadata(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.eql({
        extension: 'html',
        layout: 'layout_with_metadata',
        url: '/file_with_layout_metadata.html',
        title: 'a page',
      });
      done();
    });
  });

  it('should have the correct page.uri for a file in a subdirectory', function(done) {
    var fixture = fixturize('simple','/subdir/subdirpage.txt');
    nwebby.getMetadata(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.eql({
        extension: 'html',
        layout: 'default',
        url: '/subdir/subdirpage.html',
        title: 'subdirpage',
      });
      done();
    });
  });

  it('should have the correct page.uri for an index page in a subdirectory', function(done) {
    var fixture = fixturize('simple','/subdir/index.txt');
    nwebby.getMetadata(fixture.filename,fixture.options, function(err, result) {
      expect(err).to.be(null);
      expect(result).to.eql({
        extension: 'html',
        layout: 'default',
        url: '/subdir/',
        title: 'subdirpage',
      });
      done();
    });
  });

});
