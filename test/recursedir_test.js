'use strict';

var expect = require('chai').expect;
var {recurseDir} = require('../lib/util/recurseDir');


describe('Directory Recurse', function() {
  it('should return an array of directory paths', function(done) {
    var baseDir = '/opt';
    var file = '/opt/dira/dirb/dirc/file';

    var expectedDirs = [
      '/opt',
      '/opt/dira',
      '/opt/dira/dirb',
      '/opt/dira/dirb/dirc'
    ];
    var dirs = recurseDir(baseDir, file);
    expect(dirs).to.deep.equal(expectedDirs);
    done();
  });
});
