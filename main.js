var gleech = require('./lib/gleech').gleech;
var functions = [
  'pixelate',
  'fractalGhosts',
  'fractalGhosts2',
  'fractalGhosts3',
  'slice',
  'dither8bit',
  'shortSort',
  'sortA',
  'sortB',
  'sort',
  'sliceSort',
  'sortRows',
  'rgbGlitch',
  'invert',
  'anySort',
  'anyShortSort',
  'redShift',
  'greenShift',
  'blueShift',
  'superShift',
  'ditherRandom',
  'ditherRandomColor',
  'ditherBitshift'
];
gleech('./examples/Lenna.png', function() {
  var i = ~~(functions.length * Math.random());
  this[functions[i]]();
  this.render(function() {
    this.save('./examples/output.png');
  });
});
