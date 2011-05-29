/*
 * Thanks to http://www.mybunnyhug.com/fileformats/pgm/
 */

// imports
var sys = require('sys'),
    fs  = require('fs')
    parser = require('./lib/parser'),
    generator = require('./lib/generator');

//exports
exports.parser = parser;
exports.generator = generator;
exports.version = '0.0.1';

exports.test = function(){
  var pgmParser = parser.createParser();
  pgmParser.on('end', function(pgm){
    console.log(pgm.pads[1]);
  });
  pgmParser.parseStream(fs.createReadStream('./data/E_Kit.PGM'));
}