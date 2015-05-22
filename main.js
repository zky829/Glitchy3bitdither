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

var i = functions.length - 1;
(function() {
  var fun = functions[i];
  try {
    gleech('./examples/Lenna.png', function(fun) {
      console.log(fun);
      this[fun]();
      this.render(function() {
        this.save('./examples/' + fun + '.png');
      });
    });
  } catch (e) {
    console.log('%s failed with %s', fun, e);
  }
  i--;
  setTimeout(arguments.callee, 30);
})(i);
