#!/usr/bin/env node

let cli = require("../lib/cli");

const myArgs = process.argv.slice(2);

const { resolvePath } = require('../lib/util/resolvePath');
const path = require('path');

const chokidar = require('chokidar');
const { basename } = require("path");

const { invalidatePartials }  = require('../lib/readPartials');


let srcArg = myArgs[0];
let destArg = myArgs[1];
let fileArg = myArgs[2];

if (myArgs.length < 2) {
    console.log("need at least 2 arguments: nwebby <srcDir> <destDir> [filename]")
    process.exit(-1);
}

let srcDir = path.resolve('.',resolvePath(srcArg));
let destDir = path.resolve('.',resolvePath(destArg))


// Initialize watcher.
const watcher = chokidar.watch(srcDir, { persistent: true });
 
// Add event listeners.
watcher
  .on('change', (filePath) => {
      console.log(`File ${filePath} has been added`)
      // make relative to srcDir
      const relativePath = path.relative(srcDir,filePath);

      let baseName = path.basename(relativePath);
      if (baseName.startsWith("_")) {
        console.log("got partial - re-render all");
        invalidatePartials();
        cli.renderDir(srcDir,destDir);

      } else {
        cli.renderDir(srcDir,destDir, relativePath);

      }

  })
//  .on('change', path => log(`File ${path} has been changed`))
//  .on('unlink', path => log(`File ${path} has been removed`));

