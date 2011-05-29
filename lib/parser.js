// imports
var sys = require('sys'),
    util = require('util'),
    events = require('events'),
    Binary = require('binary');

// exports
exports.Parser = Parser;
exports.createParser = createParser;


function Parser() {
  events.EventEmitter.call(this);
}

util.inherits(Parser, events.EventEmitter);

Parser.prototype.parseStream = function(stream) {
  var that = this;
  var bytes = new Buffer(0);

  stream.on('error', function(error){
    that.emit('error', error);
  });
  stream.on('data', function(data){
    var oldBytes = bytes;
    
    bytes = new Buffer(oldBytes.length + data.length);
    oldBytes.copy(bytes);
    data.copy(bytes, oldBytes.length);
  });
  stream.on('end', function(){
    that.parseBytes(bytes);
  });
}

Parser.prototype.parseBytes = function(bytes) {
  this.parseWithParser(Binary.parse(bytes));
  this.emit('end', this.pgm);
}

Parser.prototype.parseWithParser = function(parser) {
  var that = this;
// header
  parser.word16ls('dataLength')
        .skip(2)
        .buffer('filetype', 16)
        .skip(4)
        .tap(function(vars){
          vars.filetype = vars.filetype.toString('ascii');
          if (vars.filetype !== "MPC1000 PGM 1.00") {
            that.emit('error', 'wrong filetype');
          }
        });

// pads
  parser.loop(parsePads());

  that.pgm = parser.vars;
}

function parsePads(){
  var padIndex = 0;
  
  return function(end, vars) {
    var parser = this;

    parser.loop(parseSamples());
    
    // parsing 68 bytes of pad data
    parser.skip(2)//padding
          .word8ls('pad.voiceOverlap')
          .word8ls('pad.muteGroup')
          .skip(1)//padding
          .skip(1)//unknown
          .word8ls('pad.attack')
          .word8ls('pad.decay')
          .word8ls('pad.decayMode')
          .skip(2)//padding
          .word8ls('pad.velocityToLevel')
          .skip(5)//padding
          .word8ls('pad.filter1Type')
          .word8ls('pad.filter1Freq')
          .word8ls('pad.filter1Res')
          .skip(4)//padding
          .word8ls('pad.filter1VelocityToFrequency')
          .word8ls('pad.filter2Type')
          .word8ls('pad.filter2Freq')
          .word8ls('pad.filter2Res')
          .skip(4)//padding
          .word8ls('pad.filter2VelocityToFrequency')
          .skip(14)//padding
          .word8ls('pad.mixerLevel')
          .word8ls('pad.mixerPan')
          .word8ls('pad.output')
          .word8ls('pad.fxSend')
          .word8ls('pad.fxSendLevel')
          .word8ls('pad.filterAttenuation')
          .skip(15);//padding

    if (vars.pads === undefined) vars.pads = [];
    vars.pads[padIndex] = vars.pad;
    delete vars.pad;
    
    if (++padIndex >= 2) end();
  }
}

function parseSamples() {
  var sampleIndex = 0;
  
  return function(end, vars) {
    var parser = this;
    
    parser.buffer('pad.sample.name', 16)
          .skip(1)//padding
          .word8ls('pad.sample.level')
          .word8ls('pad.sample.rangeLower')
          .word8ls('pad.sample.rangeUpper')
          .word16ls('pad.sample.tuning') // Tuning in cents (1 semitone = 100 cents)
          .word8ls('pad.sample.playMode')// 0="One Shot", 1="Note On"
          .skip(1)//padding
          .tap(function(vars){
            vars.pad.sample.name = vars.pad.sample.name.toString('ascii');
            vars.pad.sample.name = vars.pad.sample.name.replace(/\u0000/g, ''); // stip out the padding zeros
          });

    if (vars.pad.samples === undefined) vars.pad.samples = [];
    vars.pad.samples[sampleIndex] = vars.pad.sample;
    delete vars.pad.sample;
    
    if (++sampleIndex >= 4) end();
  }
}


// factory
function createParser() {
  return new Parser();
}