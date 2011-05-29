// imports
var sys = require('sys'),
    util = require('util'),
    events = require('events'),
    Put = require('put');


//exports
exports.Generator = Generator;
exports.createGenerator = createGenerator;


// constructor
function Generator() {
  events.EventEmitter.call(this);
  
}

util.inherits(Generator, events.EventEmitter);

Generator.prototype.generate = function(pgm, outStream) {
  this.buffer = new Buffer(pgm.dataLength);
  
  outStream.write(buffer);
}


//factory
function createGenerator(){
  return new Generator();
}