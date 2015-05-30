var gleech = require('./lib/gleech').gleech;
var functions = [
  'pixelate',
  'fractalGhosts',
  'fractalGhosts2',
  'fractalGhosts3',
  'slice',
  'dither8bit',
  'shortSort',
  'sort',
  'sliceSort',
  'sortRows',
  'rgbGlitch',
  'invert',
  'redShift',
  'greenShift',
  'blueShift',
  'superShift',
  'ditherRandom',
  'ditherRandomColor',
  'ditherBitshift'
];

try {
  gleech('./examples/Lenna.png', function(fun) {
    var i = Math.floor(functions.length * Math.random());
    fun = process.argv[2] || functions[i];
    console.log(' > attempting to run funtion: %s', fun);
    this[fun]();
    this.render(function() {
      this.save('./examples/' + fun + '.png');
    });
  });
} catch (e) {
  console.log('%s failed with %s', fun, e);
}
