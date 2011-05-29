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
exports.emptyPGM = emptyPGM;

function emptyPGM(){
  var emptyPGMBytes = fs.readFileSync('./data/Program01.PGM');
  var pgmParser = parser.createParser();
  pgmParser.parseBytes(emptyPGMBytes);
  return pgmParser.pgm;
};