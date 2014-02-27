#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require("commander");
var fs = require("fs");
var Glitchy3bitdither = require("./lib/GlitchyDither.js").GLITCH;

program
  .version(require('./package.json').version)
  .option('-x, --experimental', 'Use experimental functions (optional)')
  .option('-l, --list', 'list available functions')
  .option('-f, --file <file>', 'Input File')
  .option('-o, --output <file>', 'Output File')
  .option('-g, --glitch <name>', 'A glitch function, or list of glitch functions, to apply to an image/file');

program.on('--help', function(){
  console.log('');
  console.log('Fork on Github @ http://github.com/JKirchartz/Glitchy3bitdither'); // more helpful info here, idk if i'll need it w/ the --list function.
});


program.on('--list', function(){
    console.log("list");
     Glitchy3bitdither(program.args);
});

if(program.file && program.output){
     program.file = fs.readFile(program.file);
     fs.writeFile(Glitchy3bitdither(program.args));
}

program.parse(process.argv);
