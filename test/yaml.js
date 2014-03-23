'use strict';

var expect = require('expect.js');
var nwebby = require('..');
var path = require('path');

var fixturize = function(baseDir, filepath) {
  return {
    filename: path.join(__dirname, 'fixtures', baseDir, filepath),
    options: {
      baseDir: path.join(__dirname, 'fixtures', baseDir)
    }
  };
};

describe('Yaml Scanning', function() {

  it('should read the directory yaml a plain file', function(done) {
    var fixture = fixturize('simple','variable_from_directory_yaml.txt');
    nwebby.readYamls(fixture.filename,fixture.options, function(err,result) {
      expect(err).to.be(null);
      var expected = {
        settings: { section: 'sectionA'} 
      };
      expect(result).to.eql(expected);
      done();
    });
  });

});
