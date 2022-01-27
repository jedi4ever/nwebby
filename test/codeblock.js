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

describe('CodeBlock', function() {

    it('renders inline code blocks correctly', function(done) {
        var fixture = fixturize('codeblock','inline.txt');
        nwebby.render(fixture.filename,fixture.options, function(err, result) {
          expect(err).to.be.null;
          expect(result).to.contain('<code ');
          expect(result).to.contain('inline code');

          done();
        });
      });

      it('includes an external code blocks', function(done) {
        var fixture = fixturize('codeblock','external.txt');
        nwebby.render(fixture.filename,fixture.options, function(err, result) {
          expect(err).to.be.null;
          expect(result).to.contain('<code ');
          expect(result).to.contain('external code');

          done();
        });
      });
      
});
