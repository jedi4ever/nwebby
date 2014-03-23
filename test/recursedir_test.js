'use strict';

var expect = require('expect.js');
var nwebby = require('..');

describe('Directory Recurse', function() {
  it('should return an arry of directory paths', function(done) {
    var baseDir = '/opt';
    var file = '/opt/dira/dirb/dirc/file';

    var expectedDirs = [
      '/opt',
      '/opt/dira',
      '/opt/dira/dirb',
      '/opt/dira/dirb/dirc'
    ];
    var dirs = nwebby.recurseDir(baseDir, file);
    expect(dirs).to.eql(expectedDirs);
    done();
  });
});
