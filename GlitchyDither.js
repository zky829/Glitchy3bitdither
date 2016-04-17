window.Gleech = window.Gleech || (function Gleech(imageData) {
  "use strict";

  this.origImageData = imageData;
  this.imageData = imageData;
  this.imageWidth = imageData.width;
  this.imageHeight = imageData.height;

  this.original = function original() {
    return this.origImageData;
  };

  /***************************************************
   * Helper Functions
   ***************************************************/
  function adjustPixelError(data, i, error, multiplier) {
    data[i] = data[i] + multiplier * error[0];
    data[i + 1] = data[i + 1] + multiplier * error[1];
    data[i + 2] = data[i + 2] + multiplier * error[2];
  }
  // return random # < a
  function randFloor(a) {return Math.floor(Math.random() * a);}
  // return random # <= a
  function randRound(a) {return Math.round(Math.random() * a);}
  // return random # between A & B
  function randRange(a, b) {return Math.round(Math.random() * b) + a;}
  // relatively fair 50/50
  function coinToss() {return Math.random() > 0.5;}
  function randMinMax(min, max) {
    // generate min & max values by picking
    // one 'fairly', then picking another from the remainder
    var randA = Math.round(randRange(min, max));
    var randB = Math.round(randRange(randA, max));
    return [randA, randB];
  }
  function randMinMax2(min, max) {
    // generate min & max values by picking both fairly
    // then returning the lesser value before the greater.
    var randA = Math.round(randRange(min, max));
    var randB = Math.round(randRange(min, max));
    return randA < randB ? [randA, randB] : [randB, randA];
  }
  function randChoice(arr) {
    return arr[randFloor(arr.length)];
  }

  function randChance(percent) {
    // percent is a number 1-100
    return (Math.random() < (percent / 100));
  }

  function sum(o) {
    for (var s = 0, i = o.length; i; s += o[--i]) {}
    return s;
  }
  function leftSort(a, b) {return parseInt(a, 10) - parseInt(b, 10);}
  function rightSort(a, b) {return parseInt(b, 10) - parseInt(a, 10);}
  function blueSort(a, b) {
    var aa = a >> 24 & 0xFF,
      ar = a >> 16 & 0xFF,
      ag = a >> 8 & 0xFF,
      ab = a & 0xFF;
    var ba = b >> 24 & 0xFF,
      br = b >> 16 & 0xFF,
      bg = b >> 8 & 0xFF,
      bb = b & 0xFF;
    return aa - bb;
  }
  function redSort(a, b) {
    var aa = a >> 24 & 0xFF,
      ar = a >> 16 & 0xFF,
      ag = a >> 8 & 0xFF,
      ab = a & 0xFF;
    var ba = b >> 24 & 0xFF,
      br = b >> 16 & 0xFF,
      bg = b >> 8 & 0xFF,
      bb = b & 0xFF;
    return ar - br;
  }
  function greenSort(a, b) {
    var aa = a >> 24 & 0xFF,
      ar = a >> 16 & 0xFF,
      ag = a >> 8 & 0xFF,
      ab = a & 0xFF;
    var ba = b >> 24 & 0xFF,
      br = b >> 16 & 0xFF,
      bg = b >> 8 & 0xFF,
      bb = b & 0xFF;
    return ag - bg;
  }
  function avgSort(a, b) {
    var aa = a >> 24 & 0xFF,
      ar = a >> 16 & 0xFF,
      ag = a >> 8 & 0xFF,
      ab = a & 0xFF;
    var ba = b >> 24 & 0xFF,
      br = b >> 16 & 0xFF,
      bg = b >> 8 & 0xFF,
      bb = b & 0xFF;
    return ((aa + ar + ag + ab) / 4) - ((ba + br + bg + bb) / 4);
  }
  function randSort(a, b) {
    var sort = randChoice([coinToss, leftSort, rightSort, redSort, greenSort,
                          blueSort, avgSort]);
    return sort(a, b);
  }

  /*
     function avg(o){
     var l = o.length;
     for(var s = 0, i = l; i; s += o[--i]){};
     return s/l;
     }
     */


  /***************************************************
    * Dithering
  ***************************************************/
  this.dither8Bit = function dither8Bit() {
    var data = this.imageData.data,
      size = 4, sum_r, sum_g, sum_b, avg_r, avg_g, avg_b,
      x, y, s_y, s_x, i;
    for (y = 0; y < this.imageHeight; y += size) {
      for (x = 0; x < this.imageWidth; x += size) {
        sum_r = 0;
        sum_g = 0;
        sum_b = 0;
        for (s_y = 0; s_y < size; s_y++) {
          for (s_x = 0; s_x < size; s_x++) {
            i = 4 * (this.imageWidth * (y + s_y) + (x + s_x));
            sum_r += data[i];
            sum_g += data[i + 1];
            sum_b += data[i + 2];
          }
        }
        avg_r = (sum_r / (size * size)) > 127 ? 0xff : 0;
        avg_g = (sum_g / (size * size)) > 127 ? 0xff : 0;
        avg_b = (sum_b / (size * size)) > 127 ? 0xff : 0;
        for (s_y = 0; s_y < size; s_y++) {
          for (s_x = 0; s_x < size; s_x++) {
            i = 4 * (this.imageWidth * (y + s_y) + (x + s_x));
            data[i] = avg_r;
            data[i + 1] = avg_g;
            data[i + 2] = avg_b;
          }
        }
      }
    }
    return data;
  };

  this.ditherHalftone = function ditherHalftone() {
    var data = this.imageData;
    for (var y = 0; y <= this.imageHeight - 2; y += 3) {
      for (var x = 0; x <= this.imageWidth - 2; x += 3) {
        var sum_r = 0, sum_g = 0, sum_b = 0;
        var indexed = [];
        var count = 0;
        for (var s_y = 0; s_y < 3; s_y++) {
          for (var s_x = 0; s_x < 3; s_x++) {
            var i = 4 * (this.imageWidth * (y + s_y) + (x + s_x));
            sum_r += data[i];
            sum_g += data[i + 1];
            sum_b += data[i + 2];
            data[i] = data[i + 1] = data[i + 2] = 0xff;
            indexed.push(i);
            count++;
          }
        }
        var avg_r = (sum_r / 9) > 127 ? 0xff : 0;
        var avg_g = (sum_g / 9) > 127 ? 0xff : 0;
        var avg_b = (sum_b / 9) > 127 ? 0xff : 0;
        var avg_lum = (avg_r + avg_g + avg_b) / 3;
        var scaled = Math.round((avg_lum * 9) / 255);
        if (scaled < 9) {
          data[indexed[4]] = avg_r;
          data[indexed[4] + 1] = avg_g;
          data[indexed[4] + 2] = avg_b;
        }
        if (scaled < 8) {
          data[indexed[5]] = avg_r;
          data[indexed[5] + 1] = avg_g;
          data[indexed[5] + 2] = avg_b;
        }
        if (scaled < 7) {
          data[indexed[1]] = avg_r;
          data[indexed[1] + 1] = avg_g;
          data[indexed[1] + 2] = avg_b;
        }
        if (scaled < 6) {
          data[indexed[6]] = avg_r;
          data[indexed[6] + 1] = avg_g;
          data[indexed[6] + 2] = avg_b;
        }
        if (scaled < 5) {
          data[indexed[3]] = avg_r;
          data[indexed[3] + 1] = avg_g;
          data[indexed[3] + 2] = avg_b;
        }
        if (scaled < 4) {
          data[indexed[8]] = avg_r;
          data[indexed[8] + 1] = avg_g;
          data[indexed[8] + 2] = avg_b;
        }
        if (scaled < 3) {
          data[indexed[2]] = avg_r;
          data[indexed[2] + 1] = avg_g;
          data[indexed[2] + 2] = avg_b;
        }
        if (scaled < 2) {
          data[indexed[0]] = avg_r;
          data[indexed[0] + 1] = avg_g;
          data[indexed[0] + 2] = avg_b;
        }
        if (scaled < 1) {
          data[indexed[7]] = avg_r;
          data[indexed[7] + 1] = avg_g;
          data[indexed[7] + 2] = avg_b;
        }
      }
    }
    return data;
  };

  this.ditherAtkinsons = function ditherAtkinsons() {
    var data = this.imageData;
    for (var y = 0; y < this.imageHeight; y++) {
      for (var x = 0; x < this.imageWidth; x++) {
        var i = 4 * (y * this.imageWidth + x);
        var old_r = data[i];
        var old_g = data[i + 1];
        var old_b = data[i + 2];
        var new_r = (old_r > 127) ? 0xff : 0;
        var new_g = (old_g > 127) ? 0xff : 0;
        var new_b = (old_b > 127) ? 0xff : 0;
        data[i] = new_r;
        data[i + 1] = new_g;
        data[i + 2] = new_b;
        var err_r = old_r - new_r;
        var err_g = old_g - new_g;
        var err_b = old_b - new_b;
        // Redistribute the pixel's error like this:
        //       *  1/8 1/8
        //  1/8 1/8 1/8
        //      1/8
        // The ones to the right...
        var adj_i = 0;
        if (x < this.imageWidth - 1) {
          adj_i = i + 4;
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          // The pixel that's down and to the right
          if (y < this.imageHeight - 1) {
            adj_i = adj_i + (this.imageWidth * 4) + 4;
            adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          }
          // The pixel two over
          if (x < this.imageWidth - 2) {
            adj_i = i + 8;
            adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          }
        }
        if (y < this.imageHeight - 1) {
          // The one right below
          adj_i = i + (this.imageWidth * 4);
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          if (x > 0) {
            // The one to the left
            adj_i = adj_i - 4;
            adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          }
          if (y < this.imageHeight - 2) {
            // The one two down
            adj_i = i + (2 * this.imageWidth * 4);
            adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
          }
        }
      }
    }
    return data;
  };

  this.ditherFloydSteinberg = function ditherFloydSteinberg() {
    var data = this.imageData;
    for (var y = 0; y < this.imageHeight; y++) {
      for (var x = 0; x < this.imageWidth; x++) {
        var i = 4 * (y * this.imageWidth + x);
        var old_r = data[i];
        var old_g = data[i + 1];
        var old_b = data[i + 2];
        var new_r = (old_r > 127) ? 0xff : 0;
        var new_g = (old_g > 127) ? 0xff : 0;
        var new_b = (old_b > 127) ? 0xff : 0;
        data[i] = new_r;
        data[i + 1] = new_g;
        data[i + 2] = new_b;
        var err_r = old_r - new_r;
        var err_g = old_g - new_g;
        var err_b = old_b - new_b;
        // Redistribute the pixel's error like this:
        //   * 7
        // 3 5 1
        // The ones to the right...
        var right_i = 0, down_i = 0, left_i = 0, next_right_i = 0;
        if (x < this.imageWidth - 1) {
          right_i = i + 4;
          adjustPixelError(data, right_i, [err_r, err_g, err_b], 7 / 16);
          // The pixel that's down and to the right
          if (y < this.imageHeight - 1) {
            next_right_i = right_i + (this.imageWidth * 4);
            adjustPixelError(data, next_right_i, [err_r, err_g, err_b],
                             1 / 16);
          }
        }
        if (y < this.imageHeight - 1) {
          // The one right below
          down_i = i + (this.imageWidth * 4);
          adjustPixelError(data, down_i, [err_r, err_g, err_b], 5 / 16);
          if (x > 0) {
            // The one down and to the left...
            left_i = down_i - 4;
            adjustPixelError(data, left_i, [err_r, err_g, err_b], 3 /
                             16);
          }
        }
      }
    }
    return data;
  };

  this.ditherBayer = function ditherBayer() {
    /* added more threshold maps and the randomizer, the rest is stock */
    var data = this.imageData,
      threshold_maps = [
      [
        [3, 7, 4],
        [6, 1, 9],
        [2, 8, 5]
      ],
      [
        [1, 9, 3, 11],
        [13, 5, 15, 7],
        [4, 12, 2, 10],
        [16, 8, 14, 6]
      ],
      [
        [1, 49, 13, 61, 4, 52, 16, 64],
        [33, 17, 45, 29, 36, 20, 48, 32],
        [9, 57, 5, 53, 12, 60, 8, 56],
        [41, 25, 37, 21, 44, 28, 40, 24],
        [3, 51, 15, 63, 2, 50, 14, 62],
        [35, 19, 47, 31, 34, 18, 46, 30],
        [11, 59, 7, 55, 10, 58, 6, 54],
        [43, 27, 39, 23, 42, 26, 38, 22]
      ]
    ],
    threshold_map = threshold_maps[randFloor(threshold_maps.length)],
      size = threshold_map.length;
    for (var y = 0; y < this.imageHeight; y++) {
      for (var x = 0; x < this.imageWidth; x++) {
        var i = 4 * (y * this.imageWidth + x);
        var gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        var scaled = (gray * 17) / 255;
        var val = scaled < threshold_map[x % size][y % size] ? 0 : 0xff;
        data[i] = data[i + 1] = data[i + 2] = val;
      }
    }
    return data;
  };

  this.ditherBayer = function ditherBayer3() {
    /* adding in more threshold maps, and the randomizer */
    var data = this.imageData,
    threshold_maps = [
      [
        [3, 7, 4],
        [6, 1, 9],
        [2, 8, 5]
      ],
      [
        [1, 9, 3, 11],
        [13, 5, 15, 7],
        [4, 12, 2, 10],
        [16, 8, 14, 6]
      ],
      [
        [1, 49, 13, 61, 4, 52, 16, 64],
        [33, 17, 45, 29, 36, 20, 48, 32],
        [9, 57, 5, 53, 12, 60, 8, 56],
        [41, 25, 37, 21, 44, 28, 40, 24],
        [3, 51, 15, 63, 2, 50, 14, 62],
        [35, 19, 47, 31, 34, 18, 46, 30],
        [11, 59, 7, 55, 10, 58, 6, 54],
        [43, 27, 39, 23, 42, 26, 38, 22]
      ]
    ],
    threshold_map = threshold_maps[randFloor(threshold_maps.length)],
      size = threshold_map.length;
    for (var y = 0; y < this.imageHeight; y++) {
      for (var x = 0; x < this.imageWidth; x++) {
        var i = 4 * (y * this.imageWidth + x);
        /* apply the tranformation to each color */
        data[i] = ((data[i] * 17) / 255) < threshold_map[x % size][y %
          size] ? 0 : 0xff;
          data[i + 1] = ((data[i + 1] * 17) / 255) < threshold_map[x %
            size][y % size] ? 0 : 0xff;
            data[i + 2] = ((data[i + 2] * 17) / 255) < threshold_map[x %
              size][y % size] ? 0 : 0xff;
      }
    }
    return data;
  };

  this.ditherRandom = function ditherRandom() {
    var data = this.imageData;
    for (var i = 0, val, scaled, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      scaled = ((data[i] + data[i + 1] + data[i + 2]) / 3) % 255;
      val = scaled < randRound(128) ? 0 : 0xff;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
    return data;
  };

  this.ditherRandom3 = function ditherRandom3() {
    var data = this.imageData;
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      data[i] = data[i] < randRound(128) ? 0 : 0xff;
      data[i + 1] = data[i + 1] < randRound(128) ? 0 : 0xff;
      data[i + 2] = data[i + 2] < randRound(128) ? 0 : 0xff;
    }
    return data;
  };

  this.ditherBitmask = function ditherBitmask() {
    var data = this.imageData,
        M = randRange(1, 125);
    // 0xc0; 2 bits
    // 0xe0  3 bits
    // 0xf0  4 bits
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      // data[i] |= M;
      // data[i + 1] |= M;
      // data[i + 2] |= M;
      data[i] |= M;
      data[i + 1] |= M;
      data[i + 2] |= M;
    }
    return data;
  };


  /***************************************************
   * Glitch
   ***************************************************/
  this.colorShift = function colorShift() {
    var data = this.imageData,
        dir = coinToss();
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      var r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      data[i] = dir ? g : b;
      data[i + 1] = dir ? b : r;
      data[i + 2] = dir ? r : g;
    }
    return data;
  };
  this.colorShift2 = function colorShift2() {
    var data = new Uint32Array(this.imageData.data.buffer),
        dir = coinToss();
    for (var i = 0, size = data.length; i < size; i++) {
      var a = data[i] >> 24 & 0xFF,
        r = data[i] >> 16 & 0xFF,
        g = data[i] >> 8 & 0xFF,
        b = data[i] & 0xFF;
      r = (dir ? g : b) & 0xFF;
      g = (dir ? b : r) & 0xFF;
      b = (dir ? r : g) & 0xFF;
      data[i] = (a << 24) + (r << 16) + (g << 8) + (b);
    }
    return data;
  };

  this.greenShift = function greenShift() {
    var data = this.imageData.data,
      factor = randFloor(64);
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      var shift = data[i + 1] + factor;
      data[i] -= factor;
      data[i + 1] = (shift) > 255 ? 255 : shift;
      data[i + 2] -= factor;
    }
    return data;
  };

  this.redShift = function redShift() {
    var data = this.imageData,
      factor = randFloor(64);
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      var shift = data[i] + factor;
      data[i] = (shift) > 255 ? 255 : shift;
      data[i + 1] -= factor;
      data[i + 2] -= factor;
    }
    return data;
  };

  this.blueShift = function blueShift() {
    var data = this.imageData,
      factor = randFloor(64);
    for (var i = 0, size = this.imageWidth * this.imageHeight * 4; i < size; i += 4) {
      var shift = data[i + 2] + factor;
      data[i] -= factor;
      data[i + 1] -= factor;
      data[i + 2] = (shift) > 255 ? 255 : shift;
    }
    return data;
  };

  this.superShift = function superShift() {
    var data = this.imageData;
    for (var i = 0, l = randRange(1, 10); i < l; i++) {
      data = colorShift();
    }
    return data;
  };

  // TODO: delete this function
  this.getColors = function getColors() {
    var data = new Uint32Array(this.imageData.data.buffer);
    console.log(data[0].toString(16));
    console.log((~ data[0] | 0xFF000000).toString(16));
    for (var i = 8; i--;) {
      console.log(randChoice(data).toString(16));
    }
    return data;
  };

  this.superPixelFunk = function superPixelFunk() {
    var data = new Uint32Array(this.imageData.data.buffer),
      pixelation = randRange(2, 15);
    for (var y = 0; y < this.imageHeight; y += pixelation) {
      for (var x = 0; x < this.imageWidth; x += pixelation) {
        if (coinToss()) {
          var locale = coinToss();
          var mask = randChoice([0x00FF0000, 0x0000FF00, 0x000000FF]);
          var i = coinToss() ? (y * this.imageWidth + x) :
            (y * this.imageWidth + (x - (pixelation * 2)));
          for (var n = 0; n < pixelation; n++) {
            for (var m = 0; m < pixelation; m++) {
              if (x + m < this.imageWidth) {
                var j = ((this.imageWidth * (y + n)) + (x + m));
                data[j] = locale ? data[i] : data[j] | mask;
              }
            }
          }
        }
      }
    }
    return data;
  };

  this.pixelFunk = function pixelFunk() {
    var data = new Uint32Array(this.imageData.data.buffer),
      pixelation = randRange(2, 10);
    for (var y = 0; y < this.imageHeight; y += pixelation) {
      for (var x = 0; x < this.imageWidth; x += pixelation) {
        if (coinToss()) {
          var i = (y * this.imageWidth + x);
          for (var n = 0; n < pixelation; n++) {
            for (var m = 0; m < pixelation; m++) {
              if (x + m < this.imageWidth) {
                var j = ((this.imageWidth * (y + n)) + (x + m));
                data[j] = data[i];
              }
            }
          }
        }
      }
    }
    return data;
  };
  this.focusImage = function focusImage() {
    var data = new Uint32Array(this.imageData.data.buffer),
      pixelation = randRange(2, 10);
    for (var y = 0; y < this.imageHeight; y += pixelation) {
      for (var x = 0; x < this.imageWidth; x += pixelation) {
        var i = (y * this.imageWidth + x);
        for (var n = 0; n < pixelation; n++) {
          for (var m = 0; m < pixelation; m++) {
            if (x + m < this.imageWidth) {
              var j = ((this.imageWidth * (y + n)) + (x + m));
              data[j] = data[i];
            }
          }
        }
      }
    }
    return data;
  };

  this.slice = function slice() {
    var data = this.imageData.data,
      cutend = randFloor(this.imageWidth * this.imageHeight * 4),
      cutstart = Math.floor(cutend / 1.7),
      cut = data.subarray(cutstart, cutend);
    data.set(cut, randFloor((this.imageWidth * this.imageHeight * 4) - cut.length));
    // imageData.data.set(data);
    return data;
  };

  this.slice2 = function slice2() {
    var data = this.imageData.data;
    for (var i = 0, l = randRound(11); i < l; i++) {
      var cutend = Math.random() < 0.75 ? randFloor(this.imageWidth * this.imageHeight * 4) :
        (this.imageWidth * this.imageHeight * 4),
      cutstart = Math.floor(cutend / 1.7),
        cut = data.subarray(cutstart, cutend);
      //data.set(cut, randFloor(this.imageWidth * this.imageHeight * 2));
      data.set(cut, randFloor((this.imageWidth * this.imageHeight * 4) - cut.length));
    }
    // imageData.data.set(data);
    return data;
  };

  this.slice3 = function slice3() {
    var data = this.imageData.data;
    for (var i = 0, l = randRound(20); i < l; i++) {
      var cutend = randFloor(this.imageWidth * this.imageHeight * 4),
        cutstart = cutend - randRange(1000, 5100),
        cut = data.subarray(cutstart, cutend);
      data.set(cut, randFloor((this.imageWidth * this.imageHeight * 4) - cut.length));
      //data.set(cut, randFloor(this.imageWidth * this.imageHeight * 2));
    }
    // imageData.data.set(data);
    return data;
  };


  this.superSlice2 = function superSlice2() {
    var functs = [slice, slice2, slice3];
    var data = this.imageData;
    for (var i = 0, l = randRound(functs.length); i < l; i++) {
      var fun = randFloor(functs.length);
      data = functs[fun](data);
    }
    return data;
  };

  this.superSlice = function superSlice() {
    var data = this.imageData;
    for (var i = 0, l = randRange(1, 10); i < l; i++) {
      data = slice(slice2(slice3(data)));
    }
    return data;
  };

  this.fractalGhosts = function fractalGhosts() {
    var data = this.imageData.data;
    for (var i = 0; i < data.length; i++) {
      if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10)) {
        data[i] = data[i * 2 % data.length];
      }
    }
    // imageData.data.set(data);
    return data;
  };
  this.fractalGhosts2 = function fractalGhosts2() {
    var data = this.imageData.data,
      rand = randRange(1, 10);
    for (var i = 0; i < data.length; i++) {
      var tmp = (i * rand) % data.length;
      if (parseInt(data[tmp], 10) < parseInt(data[i], 10)) {
        data[i] = data[tmp];
      }
    }
    // imageData.data.set(data);
    return data;
  };

  this.fractalGhosts3 = function fractalGhosts3() {
    var data = this.imageData.data,
      rand = randRange(1, 10),
      color = randRange(0, 4);
    for (var i = 0; i < data.length; i++) {
      if ((i % 4) === color) {
        data[i] = 0xFF;
        continue;
      }
      var tmp = (i * rand) % data.length;
      if (parseInt(data[tmp], 10) < parseInt(data[i], 10)) {
        data[i] = data[tmp];
      }
    }
    // imageData.data.set(data);
    return data;
  };

  this.fractalGhosts4 = function fractalGhosts4() {
    var data = this.imageData.data,
      color = randRange(0, 4);
    for (var i = 0; i < data.length; i++) {
      if ((i % 4) === color) {
        data[i] = 0xFF;
        continue;
      }
      if (parseInt(data[i * 2 % data.length], 10) < parseInt(data[i], 10)) {
        data[i] = data[i * 2 % data.length];
      }
    }
    // imageData.data.set(data);
    return data;
  };
  this.fractal = function fractal() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var i = data.length; i; i--) {
      if (parseInt(data[(i * 2) % data.length], 10) < parseInt(data[i], 10)) {
        data[i] = data[(i * 2) % data.length];
      }
    }
    return data;
  };
  this.fractal2 = function fractal2() {
    var data = new Uint32Array(this.imageData.data.buffer);
    var m = randRange(2, 8);
    for (var i = 0; i < data.length; i++) {
      if (parseInt(data[(i * m) % data.length], 10) < parseInt(data[i], 10)) {
        data[i] = data[(i * m) % data.length];
      }
    }
    return data;
  };
  this.shortsort = function shortsort() {
    var data = new Uint32Array(this.imageData.data.buffer),
      mm = randMinMax(0, this.imageWidth * this.imageWidth), cut;
    mm = randMinMax2(mm[0], mm[1]);
    cut = data.subarray(mm[0], mm[1]);
    if (coinToss()) {
      Array.prototype.sort.call(cut, leftSort);
    } else {
      Array.prototype.sort.call(cut, rightSort);
    }
    imageData.data.set(data.buffer);
    return data;
  };
  this.shortdumbsort = function shortdumbsort() {
    var data = new Uint32Array(this.imageData.data.buffer),
      mm = randMinMax(0, this.imageWidth * this.imageHeight), da;
    mm = randMinMax2(mm[0], mm[1]);
    da = data.subarray(mm[0], mm[1]);
    Array.prototype.sort.call(da);
    imageData.data.set(da, mm[0]);
    return data;
  };

  this.sort = function sort() {
    var data = new Uint32Array(this.imageData.data.buffer);
    if (coinToss()) {
      Array.prototype.sort.call(data, leftSort);
    } else {
      Array.prototype.sort.call(data, rightSort);
    }
    imageData.data.set(data, 0);
    return data;
  };
  this.slicesort = function slicesort() {
    var data = new Uint32Array(this.imageData.data.buffer),
      mm = randMinMax(0, data.length);
    mm = randMinMax(mm[0], mm[1]);
    mm = randMinMax(mm[0], mm[1]);
    var cut = data.subarray(mm[0], mm[1]),
      offset = Math.abs(randRound(data.length) - cut.length) % data.length;
    Array.prototype.sort.call(cut, leftSort);
    imageData.data.set(data.buffer, coinToss() ? offset : mm[0]);
    return data;
  };

  this.sortRows = function sortRows() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var i = 0, size = data.length + 1; i < size; i += this.imageWidth) {
      var da = data.subarray(i, i + this.imageWidth);
      Array.prototype.sort.call(da, leftSort);
      da.copyWithin(data, i);
    }
    imageData.data.set(data.buffer);
    return data;
  };

  this.sortStripe = function sortStripe() {
    var data = new Uint32Array(this.imageData.data.buffer),
      mm = randMinMax(0, this.imageWidth);
    mm = randMinMax2(mm[0], mm[1]);
    for (var i = 0, size = data.length + 1; i < size; i += this.imageWidth) {
      var da = data.subarray(i + mm[0], i + mm[1]);
      Array.prototype.sort.call(da, leftSort);
      da.copyWithin(data, i + mm[0]);
    }
    imageData.data.set(data.buffer);
    return data;
  };


  this.dumbSortRows = function dumbSortRows() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
      // var mm = randMinMax(i, i + this.imageWidth);
      // var da = data.subarray(mm[0], mm[1]);
      var da = data.subarray(i, i + this.imageWidth);
      Array.prototype.sort.call(da);
      data.set(da, i);
      /*
         for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
         var da = Array.apply([], data.subarray(i, i + this.imageWidth));
         da.sort(coinToss);
         data.set(da, i);
         */
    }
    imageData.data.set(data.buffer);
    return data;
  };
  this.randomSortRows = function randomSortRows() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
      // var mm = randMinMax(i, i + this.imageWidth);
      // var da = data.subarray(mm[0], mm[1]);
      var da = data.subarray(i, i + this.imageWidth);
      Array.prototype.sort.call(da, coinToss);
      data.set(da, i);
      /*
         for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
         var da = Array.apply([], data.subarray(i, i + this.imageWidth));
         da.sort(coinToss);
         data.set(da, i);
         */
    }
    imageData.data.set(data.buffer);
    return data;
  };

  this.invert = function invert() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var i = 0; i < data.length; i++) {
      data[i] = ~ data[i] | 0xFF000000;
    }
    imageData.data.set(data.buffer);
    return data;
  };
  this.rgb_glitch = function rgb_glitch() {
    var data = this.imageData.data,
      mm = randMinMax(10, this.imageWidth - 10),
      opt = mm[1] % 3,
      dir = coinToss();
    for (var y = 0; y < this.imageHeight; y++) {
      for (var x = 0; x < this.imageWidth; x++) {
        var index = ((this.imageWidth * y) + x) * 4,
          red = data[index],
          green = data[index + 1],
          blue = data[index + 2];
        if (dir) {
          if (opt === 0) {
            data[index + mm[0]] = red;
            data[index + mm[0] + 1] = green;
            data[index] = blue;
          }else if (opt === 1) {
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
          }else if (opt === 1) {
            data[index + 1] = red;
            data[index - mm[0]] = green;
            data[index - mm[0]] = blue;
          } else {
            data[index - mm[0] + 1] = red;
            data[index] = green;
            data[index - mm[0]] = blue;
          }
        }
      }
    }
    // imageData.data.set(data);
    return data;
  };
  this.DrumrollVerticalWave = function DrumrollVerticalWave() {
    /* borrowed from https://github.com/ninoseki/glitched-canvas & modified w/
     * cosine */
    var data = this.imageData.data,
      roll = 0;
    for (var x = 0; x < this.imageWidth; x++) {
      if (Math.random() > 0.95) roll = Math.floor(Math.cos(x) * (this.imageHeight * 2));
      if (Math.random() > 0.98) roll = 0;

      for (var y = 0; y < this.imageHeight; y++) {
        var idx = (x + y * this.imageWidth) * 4;

        var y2 = y + roll;
        if (y2 > this.imageHeight - 1) y2 -= this.imageHeight;
        var idx2 = (x + y2 * this.imageWidth) * 4;

        for (var c = 0; c < 4; c++) {
          data[idx2 + c] = data[idx + c];
        }
      }
    }

    // imageData.data.set(data);
    return data;
  };
  this.DrumrollHorizontalWave = function DrumrollHorizontalWave() {
    /* borrowed from https://github.com/ninoseki/glitched-canvas & modified
     * with cosine */
    var data = this.imageData.data,
      roll = 0;
    for (var x = 0; x < this.imageWidth; x++) {
      if (Math.random() > 0.95) roll = Math.floor(Math.cos(x) * (this.imageHeight * 2));
      if (Math.random() > 0.98) roll = 0;

      for (var y = 0; y < this.imageHeight; y++) {
        var idx = (x + y * this.imageWidth) * 4;

        var x2 = x + roll;
        if (x2 > this.imageWidth - 1) x2 -= this.imageWidth;
        var idx2 = (x2 + y * this.imageWidth) * 4;

        for (var c = 0; c < 4; c++) {
          data[idx2 + c] = data[idx + c];
        }
      }
    }

    // imageData.data.set(data);
    return data;
  };
  this.DrumrollVertical = function DrumrollVertical() {
    /* borrowed from https://github.com/ninoseki/glitched-canvas */
    var data = this.imageData.data,
      roll = 0;
    for (var x = 0; x < this.imageWidth; x++) {
      if (Math.random() > 0.95) roll = randFloor(this.imageHeight);
      if (Math.random() > 0.95) roll = 0;

      for (var y = 0; y < this.imageHeight; y++) {
        var idx = (x + y * this.imageWidth) * 4;

        var y2 = y + roll;
        if (y2 > this.imageHeight - 1) y2 -= this.imageHeight;
        var idx2 = (x + y2 * this.imageWidth) * 4;

        for (var c = 0; c < 4; c++) {
          data[idx2 + c] = data[idx + c];
        }
      }
    }

    // imageData.data.set(data);
    return data;
  };
  this.DrumrollHorizontal = function DrumrollHorizontal() {
    /* borrowed from https://github.com/ninoseki/glitched-canvas */
    var data = this.imageData.data,
      roll = 0;
    for (var x = 0; x < this.imageWidth; x++) {
      if (Math.random() < 0.05) roll = randFloor(this.imageHeight);
      if (Math.random() < 0.05) roll = 0;

      for (var y = 0; y < this.imageHeight; y++) {
        var idx = (x + y * this.imageWidth) * 4;

        var x2 = x + roll;
        if (x2 > this.imageWidth - 1) x2 -= this.imageWidth;
        var idx2 = (x2 + y * this.imageWidth) * 4;

        for (var c = 0; c < 4; c++) {
          data[idx2 + c] = data[idx + c];
        }
      }
    }

    // imageData.data.set(data);
    return data;
  };

  this.scanlines = function scanlines() {
    // future options:
    // type, xor/or ammount, stripe this.imageWidth
    var data = new Uint32Array(this.imageData.data.buffer),
      type = randRange(0, 3),
      size = randRange(3, 15),
      xorNum = randChoice([0x00555555, 0x00FF00FF00, 0x00F0F0F0, 0x00333333]),
      orNum = randChoice([0xFF555555, 0xFFFF00FF00, 0xFFF0F0F0, 0xFF333333]);
    for (var i = 0, l = data.length; i < l; i += (this.imageWidth * size)) {
      var row = Array.apply([], data.subarray(i, i + this.imageWidth));
      for (var p in row) {
        if (type === 0) {
          row[p] = row[p] ^ xorNum;
        } else if (type === 1) {
          row[p] = row[p] | orNum;
        } else {
          // invert
          row[p] = ~ row[p] | 0xFF000000;
        }
      }
      data.set(row, i);
    }
    imageData.data.set(data.buffer);
    return data;
  };

  this.pixelSort = function pixelSort() {
    var data = new Uint32Array(this.imageData.data.buffer);
    var upper = 0xFFAAAAAA, lower = 0xFF333333;
    for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
      var row = Array.apply([], data.subarray(i, i + this.imageWidth));
      var low = 0, high = 0;
      for (var j in row) {
        if (!high && !low && row[j] >= low) {
          low = j;
        }
        if (low && !high && row[j] >= high) {
          high = j;
        }
      }
      if (low) {
        var da = row.slice(low, high);
        Array.prototype.sort.call(da, leftSort);
        data.set(da, (i + low) % (this.imageHeight * this.imageWidth));
      }
    }
    imageData.data.set(data.buffer);
    return data;
  };



  // templates for making new glitches
  this.XYtemplate = function XYtemplate() {
    var data = new Uint32Array(this.imageData.data.buffer);
    for (var y = 0; y < this.imageHeight; ++y) {
      for (var x = 0; x < this.imageWidth; ++x) {
        // do stuff to a 32bit pixel
        // ex: invert pixel colors
        // data[y * this.imageWidth + x] = ~ data[y * this.imageWidth + x] | 0xFF000000;
      }
    }
    imageData.data.set(data.buffer);
    return data;
  };
  this.RowTemplate = function RowTemplate() {
    var data = new Uint32Array(this.imageData.data.buffer);
      for (var i = 0, size = data.length; i < size; i += this.imageWidth) {
      var row = Array.apply([], data.subarray(i, i + this.imageWidth));
      // transform `row`, which contains a row of 32bit pixels
      // ex: make a black stripe 5px apart
      // if (i % 5 == 0) {
      //   for (var p in row) {
      //     row[p] = 0xFF000000;
      //   }
      // }
      data.set(row, i);
    }
    imageData.data.set(data.buffer);
    return data;
  };

  /* global arrays of functions */
  var exp = [pixelFunk, superPixelFunk, shortsort, shortdumbsort,
    sort, slicesort, sortStripe, sortRows, randomSortRows, dumbSortRows,
  pixelSort, randomGlitch, glitch, preset1, preset2, preset3, preset4],
  orig = [focusImage, rgb_glitch, invert, slice, slice2, slice3, scanlines,
    fractalGhosts, fractalGhosts2, fractalGhosts3, fractalGhosts4, fractal,
  fractal2, DrumrollHorizontal, DrumrollVertical, DrumrollHorizontalWave,
  DrumrollVerticalWave, ditherBitmask, colorShift, colorShift2,
  ditherRandom, ditherRandom3, ditherBayer, ditherBayer3, redShift,
  greenShift, blueShift, superShift, superSlice, superSlice2,
  ditherAtkinsons, ditherFloydSteinberg, ditherHalftone, dither8Bit];

  /* these run random set of functions */

  this.theWorks = function theWorks() {
    var functions = document.getElementById('experimental').checked ?
      orig.concat(exp) : orig.slice(0),
    data = this.imageData,
    sortCounter = 0;
    functions.sort(coinToss);
    for (var i = 0, l = functions.length, s = 0; i < l; i++) {
      s = functions[i].name.indexOf('ort');
      if (s < 0 && sortCounter >= 1) {data =
        functions[i](data);continue;}
      if (s) {sortCounter++;}
    }
    return data;
  };

  this.randomGlitch = function randomGlitch() {
    var functions = document.getElementById('experimental').checked ?
      orig.concat(exp) : orig.slice(0),
    data = this.imageData,
    history = [];
    for (var i = 0, l = randRange(3, 6); i < l; i++) {
      var fun = randFloor(functions.length);
      functions[fun](data);
      history.push(functions[fun].name);
    }
    if (history.length === 0) {
      return randomGlitch(data);
    }
    console.log('randomGlitch history:', history);
    return data;
  };

  this.glitch = function glitch() {
    var hist = [];
    for (var i = 0, l = randRange(5, 10); i < l; i++) {
      switch (randFloor(13)) {
        case 0:
          data = focusImage(data);
        hist.push('focusImage');
        break;
        case 1:
          data = ditherBitmask(data);
        hist.push('ditherBitmask');
        break;
        case 2:
          data = (Math.random() > 0.5) ? superSlice(data) :
          superSlice2(data);
        hist.push('superSlice/2');
        break;
        case 3:
          data = colorShift(data);
        hist.push('colorShift');
        break;
        case 4:
          data = ditherRandom3(data);
        hist.push('ditherRandom3');
        break;
        case 5:
          data = ditherBayer3(data);
        hist.push('ditherBayer3');
        break;
        case 6:
          data = ditherAtkinsons(data);
        hist.push('ditherAtkinsons');
        break;
        case 7:
          data = ditherFloydSteinberg(data);
        hist.push('ditherFloydSteinberg');
        break;
        case 8:
          data = ditherHalftone(data);
        hist.push('ditherHalftone');
        break;
        case 9:
          data = dither8Bit(data);
        hist.push('dither8bit');
        break;
        case 10:
          if (coinToss()) {
          var picker = randFloor(3);
          if (picker == 1) {
            data = redShift(data);
            hist.push('redShift');
          } else if (picker == 2) {
            data = greenShift(data);
            hist.push('greenShift');
          } else {
            data = blueShift(data);
            hist.push('blueShift');
          }
        }
        break;
        /*
           case 11:
           data = (Math.random()>0.5) ? fractalGhosts(data) :
           fractalGhosts2(data);
           hist.push('fractalGhosts/2');
           break;
           */
        default:
        data = invert(data);
        hist.push('invert');
        break;
      }
    }
    console.log('glitch history', hist);
    return data;
  };
  var seqCounter = 0;
  this.seqGlitch = function seqGlitch() {
    var fun = document.getElementById('experimental').checked ?
      orig.concat(exp) : orig.slice(0),
      i = seqCounter % fun.length;
    seqCounter++;
    console.log('seqGlitch', fun[i].name, seqCounter);
    return fun[i]();
  };

  this.preset1 = function preset1() {
    var ops = [ditherRandom3, shortdumbsort, slice, invert,
        shortsort, shortsort, ditherRandom3, DrumrollVerticalWave,
        ditherBayer3, dumbSortRows, slicesort, DrumrollVertical];
    for (var i in ops) {
      ops[i]();
    }
    return data;
  };
  this.preset2 = function preset2() {
    var ops = [shortsort, slice2, fractalGhosts4, sort, fractalGhosts2,
        colorShift];
    for (var i in ops) {
      ops[i]();
    }
    return data;
  };
  this.preset3 = function preset3() {
    var ops = [ditherRandom3, focusImage, scanlines];
    for (var i in ops) {
      ops[i]();
    }
    return data;
  };
  this.preset4 = function preset4() {
    var ops = [ditherAtkinsons, focusImage, ditherRandom3, focusImage];
    for (var i in ops) {
      ops[i]();
    }
    return data;
  };
  /*
     this.testImage = function testImage(){
     var data = this.imageData.data;
     alert(avg(data));
     }
     */

})(imageData);
