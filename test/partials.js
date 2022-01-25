'use strict';

var expect = require('chai').expect;
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

describe('Partials', function() {

  it('should find all partials', function(done) {
    var fixture = fixturize('simple','variable_from_directory_yaml.txt');
    nwebby.readPartials(fixture.options.baseDir, function(err,result) {
      expect(err).to.be.null;
      var expected = {
       '/partial1': 'this is partial1\n',
       '/partial2/partial2': 'this is partial2\n'
      };
      expect(result).to.eql(expected);
      done();
    });
  });

});
