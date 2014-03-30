'use strict';

var expect = require('expect.js');
var nwebby = require('..');
var path = require('path');

var fullPath = function(filepath) {
  return path.join(__dirname, 'fixtures', filepath);
};

describe('Metadata Detection', function() {
  it('should error on a non-existing file', function(done) {
    var filename = fullPath('non-existing-file.txt');
    nwebby.getMetadata(filename,function(err) {
      expect(err).not.to.be(null);
      done();
    });
  });

  it('should detect on file_with_metadata.txt', function(done) {
    var filename = fullPath('file_with_metadata.txt');
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({
        title: 'hello'
      });
      done();
    });
  });

  it('should not detect on file_without_metadata.txt', function(done) {
    var filename = fullPath('file_without_metadata.txt');
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({});
      done();
    });
  });
  it('should not detect on file_with_partial_metadata.txt', function(done) {
    var filename = fullPath('file_with_partial_metadata.txt');
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({});
      done();
    });
  });

  it('should not detect on file_with_separator_not_in_beginning.txt', function(done) {
    var filename = fullPath('file_with_separator_not_in_beginning.txt');
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql({});
      done();
    });
  });

  it('should not error on file_with_unfinished_field.txt', function(done) {
    var filename = fullPath('file_with_unfinished_field.txt');
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql('bla');
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
    nwebby.getMetadata(filename,function(err,metadata) {
      expect(err).to.be(null);
      expect(metadata).to.eql('bla');
      done();
    });
  });

});
