/*
 *  Ripped, uncerimoniously from https://github.com/mncaudill/3bitdither
 *  Then I did a bunch of my own "improvements" to it...
 */


/* from here down to where noted, is all mint-condition from mncaudill */

function adjustPixelError(data, i, error, multiplier) {
  data[i] = data[i] + multiplier * error[0];
  data[i + 1] = data[i + 1] + multiplier * error[1];
  data[i + 2] = data[i + 2] + multiplier * error[2];
}

function dither8Bit(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data,
  size = 4, sum_r, sum_g, sum_b;
  for (var y = 0; y < height; y += size) {
    for (var x = 0; x < width; x += size) {
      sum_r = 0;
      sum_g = 0;
      sum_b = 0;
      for (var s_y = 0; s_y < size; s_y++) {
        for (var s_x = 0; s_x < size; s_x++) {
          i = 4 * (width * (y + s_y) + (x + s_x));
          sum_r += data[i];
          sum_g += data[i + 1];
          sum_b += data[i + 2];
        }
      }
      avg_r = (sum_r / (size * size)) > 127 ? 0xff : 0;
      avg_g = (sum_g / (size * size)) > 127 ? 0xff : 0;
      avg_b = (sum_b / (size * size)) > 127 ? 0xff : 0;
      for (var t_y = 0; t_y < size; t_y++) {
        for (var t_x = 0; t_x < size; t_x++) {
          i = 4 * (width * (y + t_y) + (x + t_x));
          data[i] = avg_r;
          data[i + 1] = avg_g;
          data[i + 2] = avg_b;
        }
      }
    }
  }
  return imageData;
}

function ditherHalftone(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var y = 0; y <= height - 2; y += 3) {
    for (var x = 0; x <= width - 2; x += 3) {
      sum_r = sum_g = sum_b = 0;
      indexed = [];
      count = 0;
      for (var s_y = 0; s_y < 3; s_y++) {
        for (var s_x = 0; s_x < 3; s_x++) {
          i = 4 * (width * (y + s_y) + (x + s_x));
          sum_r += data[i];
          sum_g += data[i + 1];
          sum_b += data[i + 2];
          data[i] = data[i + 1] = data[i + 2] = 0xff;
          indexed.push(i);
          count++;
        }
      }
      avg_r = (sum_r / 9) > 127 ? 0xff : 0;
      avg_g = (sum_g / 9) > 127 ? 0xff : 0;
      avg_b = (sum_b / 9) > 127 ? 0xff : 0;
      avg_lum = (avg_r + avg_g + avg_b) / 3;
      scaled = Math.round((avg_lum * 9) / 255);
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
  return imageData;
}

function ditherAtkinsons(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      i = 4 * (y * width + x);
      old_r = data[i];
      old_g = data[i + 1];
      old_b = data[i + 2];
      new_r = (old_r > 127) ? 0xff : 0;
      new_g = (old_g > 127) ? 0xff : 0;
      new_b = (old_b > 127) ? 0xff : 0;
      data[i] = new_r;
      data[i + 1] = new_g;
      data[i + 2] = new_b;
      err_r = old_r - new_r;
      err_g = old_g - new_g;
      err_b = old_b - new_b;
      // Redistribute the pixel's error like this:
      //       *  1/8 1/8
      //  1/8 1/8 1/8
      //      1/8
      // The ones to the right...
      if (x < width - 1) {
        adj_i = i + 4;
        adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        // The pixel that's down and to the right
        if (y < height - 1) {
          adj_i = adj_i + (width * 4) + 4;
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        }
        // The pixel two over
        if (x < width - 2) {
          adj_i = i + 8;
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        }
      }
      if (y < height - 1) {
        // The one right below
        adj_i = i + (width * 4);
        adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        if (x > 0) {
          // The one to the left
          adj_i = adj_i - 4;
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        }
        if (y < height - 2) {
          // The one two down
          adj_i = i + (2 * width * 4);
          adjustPixelError(data, adj_i, [err_r, err_g, err_b], 1 / 8);
        }
      }
    }
  }
  return imageData;
}

function ditherFloydSteinberg(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      i = 4 * (y * width + x);
      old_r = data[i];
      old_g = data[i + 1];
      old_b = data[i + 2];
      new_r = (old_r > 127) ? 0xff : 0;
      new_g = (old_g > 127) ? 0xff : 0;
      new_b = (old_b > 127) ? 0xff : 0;
      data[i] = new_r;
      data[i + 1] = new_g;
      data[i + 2] = new_b;
      err_r = old_r - new_r;
      err_g = old_g - new_g;
      err_b = old_b - new_b;
      // Redistribute the pixel's error like this:
      //   * 7
      // 3 5 1
      // The ones to the right...
      if (x < width - 1) {
        right_i = i + 4;
        adjustPixelError(data, right_i, [err_r, err_g, err_b], 7 / 16);
        // The pixel that's down and to the right
        if (y < height - 1) {
          next_right_i = right_i + (width * 4);
          adjustPixelError(data, next_right_i, [err_r, err_g, err_b], 1 / 16);
        }
      }
      if (y < height - 1) {
        // The one right below
        down_i = i + (width * 4);
        adjustPixelError(data, down_i, [err_r, err_g, err_b], 5 / 16);
        if (x > 0) {
          // The one down and to the left...
          left_i = down_i - 4;
          adjustPixelError(data, left_i, [err_r, err_g, err_b], 3 / 16);
        }
      }
    }
  }
  return imageData;
}

function ditherBayer(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data,
  /* added more threshold maps and the randomizer, the rest is stock */
  threshold_maps = [
    [[1, 3], [4, 2]],
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
  threshold_map = threshold_maps[Math.floor(Math.random() *
                                            threshold_maps.length)];
  size = threshold_map.length;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      i = 4 * (y * width + x);
      gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      scaled = (gray * 17) / 255;
      val = scaled < threshold_map[x % size][y % size] ? 0 : 0xff;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
  }
  return imageData;
}

function ditherBayer3(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data,
  /* adding in more threshold maps, and the randomizer */
  threshold_maps = [
    [[1, 3], [4, 2]],
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
  threshold_map = threshold_maps[Math.floor(Math.random() *
                                            threshold_maps.length)],
  size = threshold_map.length;
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      i = 4 * (y * width + x);
      /* apply the tranformation to each color */
      data[i] = ((data[i] * 17) / 255) <
        threshold_map[x % size][y % size] ? 0 : 0xff;
      data[i + 1] = ((data[i + 1] * 17) / 255) <
        threshold_map[x % size][y % size] ? 0 : 0xff;
      data[i + 2] = ((data[i + 2] * 17) / 255) <
        threshold_map[x % size][y % size] ? 0 : 0xff;
    }
  }
  return imageData;
}
/*
 *  here's where my fun begins
 */
// some helper functions
/*
   function avg(o){
   var l = o.length;
   for(var s = 0, i = l; i; s += o[--i]){};
   return s/l;
   }
   */


function XYtemplate(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var y = 0; y < height; ++y) {
    for (var x = 0; x < width; ++x) {
      /* do stuff to a 32bit pixel */
      data[y * width + x] = ~ data[y * width + x] | 0xFF000000;
    }
  }
  imageData.data.set(data);
  return imageData;
}
function RowTemplate(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var i = 0, row; i < data.length; i += width) {
    if (i % 3) { /* artificial limit, to make it stripey */
      row = Array.apply([], data.subarray(i, i + width));
      /* do stuff to an array of 32bit pixels */
      for (var j = 0, l = row.length; j < l; j++) {
        row[j] = ~ row[j] | 0xFF000000;
      }
      data.set(row, i);
    }
  }
  imageData.data.set(data);
  return imageData;
}
function templateTest(imageData) {
  var xy = XYtemplate(imageData),
  row = RowTemplate(imageData);
  imageData = Math.random() > 0.5 ? xy : row;
  return imageData;
}



function slice2(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var i = 0, l = (Math.random() * 11); i < l; i++) {
    var cutend = Math.random() < 0.75 ?
      Math.floor(Math.random() * (width * height * 4)) : (width * height * 4),
    cutstart = Math.floor(cutend / 1.7),
    cut = data.subarray(cutstart, cutend);
    //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
    data.set(cut, Math.floor(Math.random() *
                             ((width * height * 4) - cut.length)));
  }
  imageData.data.set(data);
  return imageData;
}

function slice3(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var i = 0, l = (Math.random() * 20); i < l; i++) {
    var cutend = Math.floor(Math.random() * (width * height * 4)),
    cutstart = cutend - Math.floor((Math.random() * 5101) + 1000),
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() *
                             ((width * height * 4) - cut.length)));
    //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
  }
  imageData.data.set(data);
  return imageData;
}

function sliceB(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data,
  mm = slice_range(width, height, 8),
  cutend = mm[1],
  cutstart = mm[0];
  cut = data.subarray(cutstart, cutend);
  data.set(cut, Math.floor(Math.random() *
                           ((width * height * 4) - cut.length)));
  return imageData;
}

function sliceB2(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var i = 0, l = (Math.random() * 11); i < l; i++) {
    var mm = slice_range(width, height, 8),
    cutend = mm[1],
    cutstart = mm[0];
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() *
                             ((width * height * 4) - cut.length)));
  }
  return imageData;
}

function sliceB3(imageData) {
  var width = imageData.width,
  height = imageData.height,
  data = imageData.data;
  for (var i = 0, l = (Math.random() * 20); i < l; i++) {
    var mm = slice_range(width, height, 8),
    cutend = mm[1],
    cutstart = mm[0],
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() *
                             ((width * height * 4) - cut.length)));
    //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
  }
  return imageData;
}

function superSlice2(imageData) {
  var functs = [slice, slice2, slice3];
  for (var i = 0, l = (Math.random() * functs.length + 1); i < l; i++) {
    var fun = Math.floor(Math.random() * functs.length);
    imageData = functs[fun](imageData);
  }
  return imageData;
}

function superSlice(imageData) {
  for (var i = 0, l = (Math.random() * 10) + 1; i < l; i++) {
    imageData = slice(slice2(slice3(imageData)));
  }
  return imageData;
}



function shortsort(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  mm = slice_range(imageData.width, imageData.height, 32),
  cut = data.subarray(mm[0], mm[1]);
  Array.prototype.sort.call(cut, numericSort);
  imageData.data.set(data.buffer);
  return imageData;
}

function sortRows(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var i = 0, size = data.length + 1; i < size; i += width) {
    var da = Array.apply([], data.subarray(i, i + width));
    da.sort(numericSort);
    data.set(da, i);
  }
  imageData.data.set(data.buffer);
  return imageData;
}

function randomSortRows(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var i = 0, size = data.length; i < size; i += width) {
    var da = Array.apply([], data.subarray(i, i + width));
    da.sort(randomSort);
    data.set(da, i);
  }
  imageData.data.set(data.buffer);
  return imageData;
}
function orSortRows(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var i = 0, size = data.length; i < size; i += width) {
    var da = Array.apply([], data.subarray(i, i + width));
    da.sort(orSort);
    data.set(da, i);
  }
  imageData.data.set(data.buffer);
  return imageData;
}
function andSortRows(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width, height = imageData.height;
  for (var i = 0, size = data.length; i < size; i += width) {
    var da = Array.apply([], data.subarray(i, i + width));
    da.sort(andSort);
    data.set(da, i);
  }
  imageData.data.set(data.buffer);
  return imageData;
}

function pixelSort(imageData) {
  var data = new Uint32Array(imageData.data.buffer),
  width = imageData.width,
  height = imageData.height;
  for (var i = 0,
           da = null,
           mm = [0, 0],
           size = data.length;
       i < size; i += width) {
    mm = randminmax(i, i + width);
    da = Array.apply([], data.subarray(mm[0], mm[1]));
    da.sort(numericSort);
    try {
      for (var x = mm[0], j = 0; x < mm[1]; x++) {
        data.set(x, da[j]);
        j++;
      }
    }catch (e) {
    }
  }
  imageData.data.set(data);
  return imageData;
}

function DrumrollVerticalWave(imageData) {
  /* borrowed from https://github.com/ninoseki/glitched-canvas &
   * modified w/ cosine */
  var data = imageData.data,
  width = imageData.width,
  height = imageData.height,
  roll = 0;
  for (var x = 0; x < width; x++) {
    if (Math.random() > 0.95) roll = Math.floor(Math.cos(x) * (height * 2));
    if (Math.random() > 0.98) roll = 0;

    for (var y = 0; y < height; y++) {
      var idx = (x + y * width) * 4;

      var y2 = y + roll;
      if (y2 > height - 1) y2 -= height;
      var idx2 = (x + y2 * width) * 4;

      for (var c = 0; c < 4; c++) {
        data[idx2 + c] = data[idx + c];
      }
    }
  }

  imageData.data = data;
  return imageData;
}
function DrumrollHorizontalWave(imageData) {
  /* borrowed from https://github.com/ninoseki/glitched-canvas
   * & modified  with cosine */
  var data = imageData.data,
  width = imageData.width,
  height = imageData.height,
  roll = 0;
  for (var x = 0; x < width; x++) {
    if (Math.random() > 0.95) roll = Math.floor(Math.cos(x) * (height * 2));
    if (Math.random() > 0.98) roll = 0;

    for (var y = 0; y < height; y++) {
      var idx = (x + y * width) * 4;

      var x2 = x + roll;
      if (x2 > width - 1) x2 -= width;
      var idx2 = (x2 + y * width) * 4;

      for (var c = 0; c < 4; c++) {
        data[idx2 + c] = data[idx + c];
      }
    }
  }

  imageData.data = data;
  return imageData;
}
function DrumrollVertical(imageData) {
  /* borrowed from https://github.com/ninoseki/glitched-canvas */
  var data = imageData.data,
  width = imageData.width,
  height = imageData.height,
  roll = 0;
  for (var x = 0; x < width; x++) {
    if (Math.random() > 0.95) roll = Math.floor(Math.random() * height);
    if (Math.random() > 0.95) roll = 0;

    for (var y = 0; y < height; y++) {
      var idx = (x + y * width) * 4;

      var y2 = y + roll;
      if (y2 > height - 1) y2 -= height;
      var idx2 = (x + y2 * width) * 4;

      for (var c = 0; c < 4; c++) {
        data[idx2 + c] = data[idx + c];
      }
    }
  }

  imageData.data = data;
  return imageData;
}
function DrumrollHorizontal(imageData) {
  /* borrowed from https://github.com/ninoseki/glitched-canvas */
  var data = imageData.data,
  width = imageData.width,
  height = imageData.height,
  roll = 0;
  for (var x = 0; x < width; x++) {
    if (Math.random() > 0.95) roll = Math.floor(Math.random() * height);
    if (Math.random() > 0.95) roll = 0;

    for (var y = 0; y < height; y++) {
      var idx = (x + y * width) * 4;

      var x2 = x + roll;
      if (x2 > width - 1) x2 -= width;
      var idx2 = (x2 + y * width) * 4;

      for (var c = 0; c < 4; c++) {
        data[idx2 + c] = data[idx + c];
      }
    }
  }

  imageData.data = data;
  return imageData;
}

