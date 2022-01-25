#!/usr/bin/env node

let cli = require("../lib/cli");

const myArgs = process.argv.slice(2);

const { resolvePath } = require('../lib/util/resolvePath');
const path = require('path');

let srcArg = myArgs[0];
let destArg = myArgs[1];
let fileArg = myArgs[2];

if (myArgs.length < 2) {
    console.log("need at least 2 arguments: nwebby <srcDir> <destDir> [filename]")
    process.exit(-1);
}

let srcDir = path.resolve('.',resolvePath(srcArg));
let destDir = path.resolve('.',resolvePath(destArg))

cli.renderDir(srcDir,destDir, fileArg);