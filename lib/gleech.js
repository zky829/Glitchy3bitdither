(function() {
  var Caman, Canvas, andSort, arrayToCanvas, numericSort, orSort, randminmax, randomSort, slice_range, sum, swapEnd32, xorSort,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (typeof require !== "undefined" && require !== null) {
    Caman = require('caman').Caman;
    Canvas = require('caman/node_modules/canvas');
  }

  sum = function(arr) {
    return arr.reduce(function(t, s) {
      return t + s;
    });
  };

  numericSort = function(a, b) {
    return a - b;
  };

  randomSort = function(a, b) {
    return Math.random() > 0.5;
  };

  orSort = function(a, b) {
    return 2147483647.5 - (a | b);
  };

  xorSort = function(a, b) {
    return 2147483647.5 - (a ^ b);
  };

  andSort = function(a, b) {
    return 2147483647.5 - (a & b);
  };

  swapEnd32 = function(val) {
    return (((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF)) >>> 8;
  };

  randminmax = function(min, max) {
    var randA, randB;
    randA = Math.floor(max * Math.random());
    randB = Math.floor(randA * Math.random());
    return [randB, randA];
  };

  slice_range = function(width, height, multiplier) {
    var mm, opt, px, ratio, tmp, x, y;
    if (multiplier == null) {
      multiplier = 4;
    }
    opt = (Math.random() * 1001) % 4;
    x = 0;
    y = 0;
    px = width * height * multiplier;
    ratio = Math.random() > 0.5 ? 1.7 : 1.61803;
    if (opt === 1) {
      x = Math.floor(Math.random() * px);
      y = Math.floor(x / ratio);
    } else if (opt === 2) {
      x = Math.random() < 0.5 ? Math.floor(Math.random() * px) : px;
      y = Math.floor(x / ratio);
    } else if (opt === 3) {
      x = Math.floor(Math.random() * px);
      y = x - Math.floor((Math.random() * 5101) + 1000);
    } else {
      mm = randminmax(0, px);
      x = mm[0];
      y = mm[1];
    }
    tmp = x - y;
    return [x, y];
  };

  arrayToCanvas = function(arr, width, height) {
    var buff, can, ctx, ctxData, i, imgdata, k, len, middle, pixel, pixelData;
    can = typeof exports !== "undefined" && exports !== null ? new Canvas() : document.createElement('canvas');
    can.width = width;
    can.height = height;
    ctx = can.getContext('2d');
    buff = new Uint8ClampedArray(arr);
    imgdata = ctx.createImageData(width, height);
    pixelData = imgdata.data;
    for (i = k = 0, len = buff.length; k < len; i = ++k) {
      pixel = buff[i];
      pixelData[i] = pixel;
    }
    middle = (width * height) * 4;
    ctx.putImageData(imgdata, 0, 0);
    ctxData = ctx.getImageData(0, 0, width, height);
    console.log(pixelData.slice(middle, middle + 4), ctxData.slice(middle, middle + 4));
    return can;
  };

  Caman.Filter.register('pixelate', function(pixelation) {
    if (pixelation == null) {
      pixelation = 5;
    }
    return this.processPlugin('pixelate', [pixelation]);
  });

  Caman.Plugin.register('pixelate', function(pixelation) {
    var data, height, i, j, k, l, m, n, o, p, ref, ref1, ref2, ref3, ref4, ref5, width, x, y;
    if (pixelation == null) {
      pixelation = 5;
    }
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = this.pixelData;
    for (y = k = 0, ref = height, ref1 = pixelation; ref1 > 0 ? k < ref : k > ref; y = k += ref1) {
      for (x = l = 0, ref2 = width, ref3 = pixelation; ref3 > 0 ? l < ref2 : l > ref2; x = l += ref3) {
        i = 4 * (y * width + x);
        for (n = o = 0, ref4 = pixelation; 0 <= ref4 ? o < ref4 : o > ref4; n = 0 <= ref4 ? ++o : --o) {
          for (m = p = 0, ref5 = pixelation; 0 <= ref5 ? p < ref5 : p > ref5; m = 0 <= ref5 ? ++p : --p) {
            if (x + m < width) {
              j = ((width * (y + n)) + (x + m)) * 4;
              data[j] = data[i];
              data[j + 1] = data[i + 1];
              data[j + 2] = data[i + 2];
            }
          }
        }
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('fractalGhosts', function() {
    return this.processPlugin('fractalGhosts', []);
  });

  Caman.Plugin.register('fractalGhosts', function() {
    var data, height, i, k, len, width;
    data = this.pixelData;
    width = this.dimensions.width;
    height = this.dimensions.height;
    for (k = 0, len = data.length; k < len; k++) {
      i = data[k];
      if (parseInt(data[i * 3 % data.length], 10) < parseInt(data[i], 10)) {
        data[i] = data[i * 2 % data.length];
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('fractalGhosts2', function(amount) {
    if (amount == null) {
      amount = 1 + Math.round(Math.random() * 10);
    }
    return this.processPlugin('fractalGhosts2', [amount]);
  });

  Caman.Plugin.register('fractalGhosts2', function(amount) {
    var data, height, i, k, len, tmp, width;
    if (amount == null) {
      amount = 1 + Math.round(Math.random() * 10);
    }
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = this.pixelData;
    for (k = 0, len = data.length; k < len; k++) {
      i = data[k];
      if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10)) {
        tmp = (i * amount) % data.length;
        if (parseInt(data[tmp], 10) < parseInt(data[i], 10)) {
          data[i] = data[tmp];
        }
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('fractalGhosts3', function(amount, gap) {
    if (amount == null) {
      amount = 1 + Math.round(Math.random() * 10);
    }
    if (gap == null) {
      gap = 4;
    }
    return this.processPlugin('fractalGhosts3', [amount, gap]);
  });

  Caman.Plugin.register('fractalGhosts3', function(amount, gap) {
    var data, height, i, k, len, tmp, width;
    if (amount == null) {
      amount = 1 + Math.round(Math.random() * 10);
    }
    if (gap == null) {
      gap = 4;
    }
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = this.pixelData;
    for (k = 0, len = data.length; k < len; k++) {
      i = data[k];
      if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10)) {
        if (i % gap === 0) {
          continue;
        }
        tmp = (i * amount) % data.length;
        if (parseInt(data[tmp], 10) < parseInt(data[i], 10)) {
          data[i] = data[tmp];
        }
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('slice', function() {
    return this.processPlugin('slice', []);
  });

  Caman.Plugin.register('slice', function() {
    var cut, cutend, cutstart, data, height, width;
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = new Uint32Array(this.pixelData);
    cutend = Math.floor(Math.random() * (width * height * 4));
    cutstart = Math.floor(cutend / 1.7);
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() * cutstart));
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('dither8bit', function(size) {
    if (size == null) {
      size = 4;
    }
    return this.processPlugin('dither8bit', [size]);
  });

  Caman.Plugin.register('dither8bit', function(size) {
    var avg_b, avg_g, avg_r, data, height, ind, k, l, o, p, q, r, r_x, r_y, ref, ref1, ref2, ref3, ref4, ref5, s_x, s_y, sum_b, sum_g, sum_r, width, x, y;
    if (size == null) {
      size = 4;
    }
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = this.pixelData;
    ind = (function(_this) {
      return function(a, b, c, d) {
        return 4 * (width * (a + b)) + c + d;
      };
    })(this);
    for (y = k = 0, ref = height; 0 <= ref ? k < ref : k > ref; y = 0 <= ref ? ++k : --k) {
      for (x = l = 0, ref1 = width; 0 <= ref1 ? l < ref1 : l > ref1; x = 0 <= ref1 ? ++l : --l) {
        sum_r = 0;
        sum_g = 0;
        sum_b = 0;
        for (s_y = o = 0, ref2 = size; 0 <= ref2 ? o < ref2 : o > ref2; s_y = 0 <= ref2 ? ++o : --o) {
          for (s_x = p = 0, ref3 = size; 0 <= ref3 ? p < ref3 : p > ref3; s_x = 0 <= ref3 ? ++p : --p) {
            sum_r += data[ind(y, s_y, x, s_x)];
            sum_g += data[ind(y, s_y, x, s_x) + 1];
            sum_b += data[ind(y, s_y, x, s_x) + 2];
          }
        }
        avg_r = sum_r / (size * size) > 127 ? 0xff : 0;
        avg_g = sum_g / (size * size) > 127 ? 0xff : 0;
        avg_b = sum_b / (size * size) > 127 ? 0xff : 0;
        for (r_y = q = 0, ref4 = size; 0 <= ref4 ? q < ref4 : q > ref4; r_y = 0 <= ref4 ? ++q : --q) {
          for (r_x = r = 0, ref5 = size; 0 <= ref5 ? r < ref5 : r > ref5; r_x = 0 <= ref5 ? ++r : --r) {
            data[ind(y, r_y, x, r_x)] = avg_r;
            data[ind(y, r_y, x, r_x) + 1] = avg_g;
          }
        }
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('shortSort', function(algo) {
    var algos;
    algos = ['', 'numericSort', 'randomSort', 'orSort', 'xorSort', 'andSort'];
    if (algo === '') {

    } else if (!algo) {
      algo = algos[Math.floor(algos.length * Math.random())];
    } else {
      if (algo.indexOf('Sort' === -1)) {
        algo += 'Sort';
      }
      if (indexOf.call(algos, algo) < 0) {
        algo = algos[Math.floor(algos.length * Math.random())];
        console.log('Invalid algo, try this on for size: %s', algo);
      }
    }
    return this.processPlugin('shortSort', [algo]);
  });

  Caman.Plugin.register('shortSort', function(algo) {
    var da, data, height, mm, width;
    data = new Uint32Array(this.pixelData);
    width = this.dimensions.width;
    height = this.dimensions.height;
    mm = slice_range(this.dimensions.width, this.dimensions.height, 1);
    da = data.subarray(mm[0], mm[1]);
    if (algo === '') {
      Array.prototype.sort.call(da);
    } else {
      Array.prototype.sort.call(da, this[algo]);
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('sort', function(algo) {
    var algos;
    algos = ['', 'numericSort', 'randomSort', 'orSort', 'xorSort', 'andSort'];
    if (algo === '') {

    } else if (!algo) {
      algo = algos[Math.floor(algos.length * Math.random())];
    } else {
      if (algo.indexOf('Sort' === -1)) {
        algo += 'Sort';
      }
      if (indexOf.call(algos, algo) < 0) {
        algo = algos[Math.floor(algos.length * Math.random())];
        console.log('Invalid algo, try this on for size: %s', algo);
      }
    }
    return this.processPlugin('sort', [algo]);
  });

  Caman.Plugin.register('sort', function(algo) {
    var da, data, height, mm, width;
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = new Uint32Array(this.pixelData);
    mm = randminmax(this.dimensions.width, this.dimensions.height, 1);
    da = data.subarray(mm[0], mm[1]);
    if (algo === '') {
      Array.prototype.sort.call(da);
    } else {
      Array.prototype.sort.call(da, this[algo]);
    }
    data.set(da, mm[0]);
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('sliceSort', function(algo) {
    return this.processPlugin('sliceSort', [algo]);
  });

  Caman.Plugin.register('sliceSort', function(algo) {
    var da, data, height, mm, offset, width;
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = new Uint32Array(this.pixelData);
    width = this.dimensions.width;
    height = this.dimensions.height;
    mm = slice_range(width, height, 1);
    da = data.subarray(mm[0], mm[1]);
    offset = Math.abs(Math.floor((Math.random() * (width * height)) - da.length));
    if (algo === '') {
      Array.prototype.sort.call(da);
    } else {
      Array.prototype.sort.call(da, this[algo]);
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('sortRows', function(algo) {
    var algos;
    algos = ['', 'numericSort', 'randomSort', 'orSort', 'xorSort', 'andSort'];
    if (algo === '') {

    } else if (!algo) {
      algo = algos[Math.floor(algos.length * Math.random())];
    } else {
      if (algo.indexOf('Sort' === -1)) {
        algo += 'Sort';
      }
      if (indexOf.call(algos, algo) < 0) {
        algo = algos[Math.floor(algos.length * Math.random())];
        console.log('Invalid algo, try this on for size: %s', algo);
      }
    }
    return this.processPlugin('sortRows', [algo]);
  });

  Caman.Plugin.register('sortRows', function(algo) {
    var cut, data, height, i, k, ref, ref1, width;
    width = this.dimensions.width;
    height = this.dimensions.height;
    data = new Uint32Array(this.pixelData);
    width = this.dimensions.width;
    height = this.dimensions.height;
    for (i = k = 0, ref = data.length, ref1 = width; ref1 > 0 ? k < ref : k > ref; i = k += ref1) {
      cut = data.subarray(i, i + width);
      Array.prototype.sort.call(cut, this[algo]);
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('sortRows', function(algo) {
    var algos;
    algos = ['', 'numericSort', 'randomSort', 'orSort', 'xorSort', 'andSort'];
    if (algo === '') {

    } else if (!algo) {
      algo = algos[Math.floor(algos.length * Math.random())];
    } else {
      if (algo.indexOf('Sort' === -1)) {
        algo += 'Sort';
      }
      if (indexOf.call(algos, algo) < 0) {
        algo = algos[Math.floor(algos.length * Math.random())];
        console.log('Invalid algo, try this on for size: %s', algo);
      }
    }
    return this.processPlugin('sortRows', [algo]);
  });

  Caman.Plugin.register('sortRows', function(algo) {
    var da, data, height, i, k, ref, ref1, width;
    data = new Uint32Array(this.pixelData);
    width = this.dimensions.width;
    height = this.dimensions.height;
    for (i = k = 0, ref = data.length, ref1 = width; ref1 > 0 ? k < ref : k > ref; i = k += ref1) {
      da = data.subarray(i, i + width);
      if (algo === '') {
        Array.prototype.sort.call(da);
      } else {
        Array.prototype.sort.call(da, this[algo]);
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Filter.register('rgbGlitch', function(dir, amount) {
    if (dir == null) {
      dir = Math.random() > 0.5;
    }
    if (typeof dir === 'number' || 'string') {
      dir = dir % 4;
    }
    return this.processPlugin('rgbGlitch', [dir, amount]);
  });

  Caman.Plugin.register('rgbGlitch', function(dir, amount) {
    var blue, data, green, height, index, k, l, mm, opt, red, ref, ref1, width, x, y;
    if (dir == null) {
      dir = Math.random() > 0.5;
    }
    data = this.pixelData;
    width = this.dimensions.width;
    height = this.dimensions.height;
    mm = randminmax(10, width);
    opt = mm[1] % 3;
    if (amount) {
      mm[0] = amount;
    }
    for (y = k = 0, ref = height; 0 <= ref ? k < ref : k > ref; y = 0 <= ref ? ++k : --k) {
      for (x = l = 0, ref1 = width; 0 <= ref1 ? l < ref1 : l > ref1; x = 0 <= ref1 ? ++l : --l) {
        index = ((width * y) + x) * 4;
        red = data[index];
        green = data[index + 1];
        blue = data[index + 2];
        if (dir) {
          if (opt === 0) {
            data[index + mm[0]] = red;
            data[index + mm[0] + 1] = green;
            data[index] = blue;
          } else if (opt === 1) {
            data[index] = red;
            data[index + mm[0] + 1] = green;
            data[index + mm[0]] = blue;
          } else {
            data[index + mm[0]] = red;
            data[index + 1] = green;
            data[index + mm[0]] = blue;
          }
        } else {
          if (opt === 0) {
            data[index - mm[0] + 1] = red;
            data[index - mm[0]] = green;
            data[index] = blue;
          } else if (opt === 1) {
            data[index + 1] = red;
            data[index - mm[0]] = green;
            data[index - mm[0]] = blue;
          } else {
            data[index - mm[0]] = red;
            data[index] = green;
            data[index - mm[0]] = blue;
          }
        }
      }
    }
    this.replaceCanvas(arrayToCanvas(data, width, height));
    return this;
  });

  Caman.Plugin.register('invert', function() {
    return this.process('invert', function(rgba) {
      var factor;
      factor = 255;
      rgba.r = rgba.r(~factor);
      rgba.g = rgba.g(~factor);
      rgba.b = rgba.b(~factor);
      return rgba;
    });
  });

  Caman.Filter.register('redShift', function() {
    var factor;
    factor = Math.floor((Math.random() * 128) / 2);
    return this.process('redShift', function(rgba) {
      rgba.r += factor % 255;
      rgba.g -= factor;
      rgba.b -= factor;
      return rgba;
    });
  });

  Caman.Filter.register('greenShift', function() {
    var factor;
    factor = Math.floor((Math.random() * 128) / 2);
    return this.process('greenShift', function(rgba) {
      rgba.r -= factor;
      rgba.g += factor % 255;
      rgba.b -= factor;
      return rgba;
    });
  });

  Caman.Filter.register('blueShift', function() {
    var factor;
    factor = Math.floor((Math.random() * 128) / 2);
    return this.process('blueShift', function(rgba) {
      rgba.r -= factor;
      rgba.g -= factor;
      rgba.b += factor % 255;
      return rgba;
    });
  });

  Caman.Filter.register('superShift', function() {
    var rand, results;
    rand = Math.round(Math.random * 10) + 1;
    results = [];
    while (rand--) {
      results.push(this.colorShift);
    }
    return results;
  });

  Caman.Filter.register('ditherRandom', function() {
    return this.process('ditherRandom', function(rgba) {
      var gray, val;
      gray = (rgba.r + rgba.g + rgba.b / 3) % 255;
      val = gray < Math.round(Math.random() * 128) ? 0 : 0xff;
      rgba.r = rgba.g = rgba.b = val;
      return rgba;
    });
  });

  Caman.Filter.register('ditherRandomColor', function() {
    return this.process('ditherRandomColor', function(rgba) {
      rgba.r = rgba.r < Math.round(Math.random() * 128) ? 0 : 0xff;
      rgba.g = rgba.g < Math.round(Math.random() * 128) ? 0 : 0xff;
      rgba.b = rgba.b < Math.round(Math.random() * 128) ? 0 : 0xff;
      return rgba;
    });
  });

  Caman.Filter.register('ditherBitshift', function(mask) {
    var masks;
    if (mask == null) {
      mask = Math.floor(Math.random() * 3);
    }
    mask = mask % 3;
    masks = [0xc0, 0xe0, 0xf0];
    return this.process('ditherBitshift', function(rgba) {
      rgba.r &= masks[mask];
      rgba.g &= masks[mask];
      rgba.b &= masks[mask];
      return rgba;
    });
  });

  if (typeof exports !== "undefined" && exports !== null) {
    exports.gleech = Caman;
  }

}).call(this);
