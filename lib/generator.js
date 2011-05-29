// imports
var sys = require('sys'),
    util = require('util'),
    fs = require('fs'),
    events = require('events'),
    Put = require('put');


//exports
exports.Generator = Generator;
exports.createGenerator = createGenerator;


// constructor
function Generator(pgm) {
  events.EventEmitter.call(this);
  
  this.pgm = pgm;
}

util.inherits(Generator, events.EventEmitter);

Generator.prototype.generateToStream = function(outStream) {
  outStream.write(this.generateBuffer());
  outStream.end();
}

Generator.prototype.generateBuffer = function() {
  var put = new Put();
  generateWithPut(put, this.pgm);
  
  var newPGMBytes = fs.readFileSync('./data/Program01.PGM');
  put.buffer().copy(newPGMBytes);
  return newPGMBytes;
}

/*
 * internal methods
 */

function generateWithPut(put, pgm) {
  // header
  put.word16le(pgm.dataLength)
     .pad(2)
     .put(paddedBufferOfString(pgm.filetype))
     .pad(4);
  
  //pads
  put.put(generatePadsBuffer(pgm.pads));
}

function generatePadsBuffer(pads) {
  var put = new Put();
  var pad;
  
  for (var padIndex=0, l=pads.length; padIndex<l; padIndex++) {
    pad = pads[padIndex];
    
    put.put(generateSamplesBuffer(pad.samples));
    
    put.pad(2)
       .word8le(pad.voiceOverlap)
       .word8le(pad.muteGroup)
       .pad(1)
       .pad(1)//unknown
       .word8le(pad.attack)
       .word8le(pad.decay)
       .word8le(pad.decayMode)
       .pad(2)
       .word8le(pad.velocityToLevel)
       .pad(5)
       .word8le(pad.filter1Type)
       .word8le(pad.filter1Freq)
       .word8le(pad.filter1Res)
       .pad(4)
       .word8le(pad.filter1VelocityToFrequency)
       .word8le(pad.filter2Type)
       .word8le(pad.filter2Freq)
       .word8le(pad.filter2Res)
       .pad(4)
       .word8le(pad.filter2VelocityToFrequency)
       .pad(14)
       .word8le(pad.mixerLevel)
       .word8le(pad.mixerPan)
       .word8le(pad.output)
       .word8le(pad.fxSend)
       .word8le(pad.fxSendLevel)
       .word8le(pad.filterAttenuation)
       .pad(15);
  }
  return put.buffer();
}

function generateSamplesBuffer(samples) {
  var put = new Put();
  var sample;
  
  for (var sampleIndex=0,l=samples.length; sampleIndex<l; sampleIndex++) {
    sample = samples[sampleIndex];
    
    put.put(paddedBufferOfString(sample.name))
       .pad(1)
       .word8le(sample.level)
       .word8le(sample.rangeLower)
       .word8le(sample.rangeUpper)
       .word16le(sample.tuning)
       .word8le(sample.playMode)
       .pad(1);
  }
  return put.buffer();
}

function paddedBufferOfString(string){
  var buf = new Buffer(16);
  for(var i=0,l=buf.length; i<l; i++) {
    buf[i]=0;
  }
  buf.write(string, 0, 'ascii');
  return buf;
}

//factory
function createGenerator(pgm){
  return new Generator(pgm);
}