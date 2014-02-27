#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var fs = require('fs');
var Glitchy3bitdither = require("./lib/GlitchyDither.js").GLITCH;

program
  .version(require('./package.json').version)
  .option('-f, --file', 'Input File')
  .option('-o, --output', 'Output File')
  .option('-g, --glitch', 'A glitch function, or list of glitch functions, to apply to an image/file')
  .option('-x, --experimental', 'Use experimental functions (optional)')
  .option('-l, --list', 'list available functions');

program.on('--help', function(){
  console.log('');
  console.log('Fork on Github @ http://github.com/JKirchartz/Glitchy3bitdither'); // more helpful info here, idk if i'll need it w/ the --list function.
});

if(program.list){
     Glitchy3bitdither()(program); 
}
if(program.file && program.output){
     program.file = fs.readFile(program.file);
     fs.writeFile(Glitchy3bitdither()(program));
}


program.parse(process.argv);
