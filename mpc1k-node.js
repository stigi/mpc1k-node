/*
 * Thanks to http://www.mybunnyhug.com/fileformats/pgm/
 */

// imports
var sys = require('sys'),
    fs  = require('fs');

//exports
exports.parse = parse;
exports.version = '0.0.1'

var sampleLength = 24;
var padLength = 68;
var padWithSamplesLength = 4 * sampleLength + padLength;


function parse(path, callback) {
  var pgm = {};

  var bytes = new Buffer(0);
  var error = null;

  var stream = fs.createReadStream(path);
  stream.addListener('end', function(){
    doParse();
    if (bytes && bytes.length > 0) {
      //sys.puts(bytes.length + 'unread bytes')
    }

  }).addListener('close', function(){
    callback(error, pgm);

  }).addListener('error', function(anError){
    error = anError;

  }).addListener('data', function(data){
    var oldBytes = bytes;
    bytes = new Buffer(oldBytes.length + data.length);
    oldBytes.copy(bytes);
    data.copy(bytes, oldBytes.length);
  });

  function doParse(data) {
    var byteOffset = 0;

    // header
    pgm.dataLength = bufferToInt(bytes.slice(0,2));
    pgm.filetype = bytes.toString('ascii', 4,20);

    if (pgm.filetype !== "MPC1000 PGM 1.00") {
      error = new Error("wrong filetype");
      pgm = nil;
    }

    byteOffset += 24;

    // pads
    pgm.pads = [];
    for (var padIndex = 0; padIndex < 64; padIndex++) {
      pgm.pads[padIndex] = parsePad(bytes.slice(byteOffset, byteOffset + padWithSamplesLength));
      byteOffset += padWithSamplesLength;
    }

    // midi
    byteOffset += 3;
    // slider

    // footer
  }

  function parseSample(data) {
    var sample = {};
    sample.name = data.slice(0, 16);
    sample.level = data.slice(17, 18);
    sample.rangeUpper = data.slice(18, 19);
    sample.rangeLower = data.slice(19, 20);
    sample.tuning = bufferToInt(data.slice(20, 22)); // Tuning in cents (1 semitone = 100 cents)
    sample.playMode = data.slice(22, 23); // 0="One Shot", 1="Note On"
    sample.padding = data.slice(23, 24);
    return sample;
  }

  function parsePad(data) {
    var offset = 0;
    var pad = {
      samples: []
    };
    for (var sampleIndex = 0; sampleIndex < 4; sampleIndex++) {
      pad.samples[sampleIndex] = parseSample(data.slice(offset, offset+sampleLength));
      offset += sampleLength;
    };
    pad.voiceOverlap = data.slice(98, 99);
    pad.muteGroup = data.slice(99, 100);
    //pad.unknown = data.slice(101, 102);
    pad.attack = data.slice(102, 103);
    pad.decay = data.slice(103, 104);
    pad.decayMode = data.slice(104, 105);
    pad.velocity = data.slice(107, 108);

    pad.filter1Type = data.slice(113, 114);
    pad.filter1Freq = data.slice(114, 115);
    pad.filter1Res = data.slice(115, 116);
    pad.filter1Velocity = data.slice(120, 121);

    pad.filter2Type = data.slice(121, 122);
    pad.filter2Freq = data.slice(122, 123);
    pad.filter2Res = data.slice(123, 124);
    pad.filter2Velocity = data.slice(128, 129);

    pad.mixerLevel = data.slice(129, 130);
    pad.mixerPan = data.slice(130, 131);
    pad.output = data.slice(131, 132);

    pad.fxSend = data.slice(132, 133);
    pad.fxSendLevel = data.slice(133, 134);
    pad.filterAttenuation = data.slice(134, 135);
    return pad;
  }
}


/*
 * Helpers
 */
function bufferToInt(buffer) {
  var result = 0;
  for (var byteIndex = 0; byteIndex < buffer.length; byteIndex++) {
    result += buffer[byteIndex] << (byteIndex * 8);
  }
  return result;
}