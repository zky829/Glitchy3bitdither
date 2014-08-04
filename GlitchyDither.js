/******************
 *  Ripped, uncerimoniously from https://github.com/mncaudill/3bitdither
 *  Then I did a bunch of my own insanity to it...
 ******************/

function drawDitherResult2(canvas, ditherer, text) {
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var result = ditherer(imageData);
    ctx.putImageData(result, 0, 0);
    var img = document.createElement('img');
    img.src = canvas.toDataURL("image/png");
    var output = document.getElementById("output");
    output.alt = text;
    output.insertBefore(img,output.childNodes[0]);
}

function drawDitherResult(canvas, ditherer, text) {
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(ditherer(imageData), 0, 0);
    var img = document.createElement('img');
    img.src = canvas.toDataURL("image/png");
    //    img.onclick = testImage(this);
    h2 = document.createElement('h2');
    h2.innerText = text;
    var output = document.getElementById("output");
    output.appendChild(h2);
    output.appendChild(img);
}


function original(imageData) {
    return imageData;
} /* from here down to where noted, is all mint-condition from mncaudill */

function adjustPixelError(data, i, error, multiplier) {
    data[i] = data[i] + multiplier * error[0];
    data[i + 1] = data[i + 1] + multiplier * error[1];
    data[i + 2] = data[i + 2] + multiplier * error[2];
}

function dither8Bit(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    size = 4;
    for (y = 0; y < height; y += size) {
        for (x = 0; x < width; x += size) {
            sum_r = 0;
            sum_g = 0;
            sum_b = 0;
            for (s_y = 0; s_y < size; s_y++) {
                for (s_x = 0; s_x < size; s_x++) {
                    i = 4 * (width * (y + s_y) + (x + s_x));
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
                    i = 4 * (width * (y + s_y) + (x + s_x));
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
            for (s_y = 0; s_y < 3; s_y++) {
                for (s_x = 0; s_x < 3; s_x++) {
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
    /* I added in more threshold maps, and the randomizer, the rest is stock - joel */
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
    threshold_map = threshold_maps[Math.floor(Math.random() * threshold_maps.length)];
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
    /* I added in more threshold maps, and the randomizer - joel */
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
    threshold_map = threshold_maps[Math.floor(Math.random() * threshold_maps.length)],
    size = threshold_map.length;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            i = 4 * (y * width + x);
            /* and applied the tranformation to each color - joel */
            data[i] = ((data[i] * 17) / 255) < threshold_map[x % size][y % size] ? 0 : 0xff;
            data[i + 1] = ((data[i + 1] * 17) / 255) < threshold_map[x % size][y % size] ? 0 : 0xff;
            data[i + 2] = ((data[i + 2] * 17) / 255) < threshold_map[x % size][y % size] ? 0 : 0xff;
        }
    }
    return imageData;
}
/************************************
 *  here's where my fun begins
 *************************************/
// some helper functions
function randminmax(min,max){
    // generate min & max values by picking
    // one "fairly", then picking another from the remainder
    var randA = Math.floor(min + (max-min) * Math.random());
    var randB = Math.floor(randA + (max-randA) * Math.random());
    if(randB-randA>20000){
        return randminmax(min,max);
    }
    return [randA,randB];
}
function slice_range(width,height){
    var opt = (Math.random() * 1001) % 4,
        x=0,y=0,
        px = (width*height*4),
        ratio=(Math.random()>0.5) ? 1.7 : 1.61803; // cheap approximation of phi, or actual phi
    if(opt==1){
        x = Math.floor((Math.random() * px));
        y = Math.floor(x / ratio);
    }else if(opt==2){
        x = Math.random() < 0.5 ? Math.floor(Math.random() * px) : px;
        y = Math.floor(x / ratio);
    }else if(opt==3){
        x = Math.floor(Math.random() * px);
        y = x - Math.floor((Math.random() * 5101) + 1000);
    }else{
        var mm = randminmax(0,px);
        x = mm[0];
        y = mm[1];
    }
    var tmp = x-y;
    return [x,y];
}
function sum(o){
    for(var s = 0, i = o.length; i; s += o[--i]){}
    return s;
}
function numericSort(a,b){return a-b;}
function randomSort(a,b){return Math.random() > 0.5;}
function orSort(a,b){return 2147483647.5 - (a | b);}
function xorSort(a,b){return 2147483647.5 - (a ^ b);}
function andSort(a,b){return 2147483647.5 - (a & b);}
/*
   function avg(o){
   var l = o.length;
   for(var s = 0, i = l; i; s += o[--i]){};
   return s/l;
   }
   */

function ditherRandom(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        scaled = gray % 255;
        val = scaled < Math.round(Math.random() * 128) ? 0 : 0xff;
        data[i] = data[i + 1] = data[i + 2] = val;
    }
    return imageData;
}

function ditherRandom2(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        data[i] = data[i] < Math.round(Math.random() * 128) ? 0 : 0xff;
        data[i + 1] = data[i + 1] < Math.round(Math.random() * 128) ? 0 : 0xff;
        data[i + 2] = data[i + 2] < Math.round(Math.random() * 128) ? 0 : 0xff;
    }
    return imageData;
}

function colorShift(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        var r = data[i],
        g = data[i + 1],
        b = data[i + 2];
        data[i] = r > Math.random() * 255 ? g : b;
        data[i + 1] = g > Math.random() * 255 ? r : b;
        data[i + 2] = b > Math.random() * 255 ? g : r;
    }
    return imageData;
}

function greenShift(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    factor = Math.floor((Math.random() * 128)/2);
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        data[i] -= factor;
        data[i + 1] += 1;
        data[i + 2] -= factor;
    }
    return imageData;
}

function redShift(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    factor = Math.floor((Math.random() * 128)/2);
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        data[i] += 1;
        data[i + 1] -= factor;
        data[i + 2] -= factor;
    }
    return imageData;
}

function blueShift(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    factor = Math.floor((Math.random() * 128)/2);
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        data[i] -= factor;
        data[i + 1] -= factor;
        data[i + 2] += 1;
    }
    return imageData;
}

function sliceB(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    mm = slice_range(width,height),
    cutend = mm[1],
    cutstart = mm[0];
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
    return imageData;
}

function sliceB2(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, l = (Math.random() * 11); i < l; i++) {
        var mm = slice_range(width,height);
        cutend = mm[1],
        cutstart = mm[0];
        cut = data.subarray(cutstart, cutend);
        data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
    }
    return imageData;
}

function sliceB3(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, l = (Math.random() * 20); i < l; i++) {
        var mm = slice_range(width,height);
        cutend = mm[1],
        cutstart = mm[0],
        cut = data.subarray(cutstart, cutend);
        data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
        //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
    }
    return imageData;
}


function ditherBitshift(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    masks = [0xc0, 0xe0, 0xf0],
    M = masks[Math.floor(Math.random() * 3)];
    // 0xc0; 2 bits
    // 0xe0  3 bits
    // 0xf0  4 bits
    for (var i = 0, size = width * height * 4; i < size; i += 4) {
        data[i] &= M;
        data[i + 1] &= M;
        data[i + 2] &= M;
    }
    return imageData;
}
function shortsort(imageData) {
    var data = imageData.data,
    mm = slice_range(imageData.width,imageData.height),
    sub = data.subarray(mm[0],mm[1]);
    var da = Array.apply( [], sub);
    da.sort(function(a,b){return (a-b)/4 - (a-b)/2;});
    imageData.data.set(data);
    return imageData;
}
function sortRows(imageData) {
    var data = new Uint32Array(imageData.data),
    width = imageData.width, height = imageData.height;
    for (var i = 0, size = data.length+1; i < size; i += width) {
        var da = Array.apply( [], data.subarray(i,i+width));
        da.sort(numericSort);
        data.set(da, i);
    }
    imageData.data.set(data);
    return imageData;
}
function randomSortRows(imageData) {
    var data = new Uint32Array(imageData.data),
    width = imageData.width, height = imageData.height;
    for (var i = 0, size = data.length; i < size; i += width) {
        var da = Array.apply( [], data.subarray(i,i+width));
        da.sort(randomSort);
        data.set(da, i);
    }
    imageData.data.set(data);
    return imageData;
}
function orSortRows(imageData) {
    var data = new Uint32Array(imageData.data),
    width = imageData.width, height = imageData.height;
    for (var i = 0, size = data.length; i < size; i += width) {
        var da = Array.apply( [], data.subarray(i,i+width));
        da.sort(orSort);
        data.set(da, i);
    }
    imageData.data.set(data);
    return imageData;
}
function andSortRows(imageData) {
    var data = new Uint32Array(imageData.data),
    width = imageData.width, height = imageData.height;
    for (var i = 0, size = data.length; i < size; i += width) {
        var da = Array.apply( [], data.subarray(i,i+width));
        da.sort(andSort);
        data.set(da, i);
    }
    imageData.data.set(data);
    return imageData;
}

function pixelSort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
        width = imageData.width,
	height = imageData.height;
    for(var i = 0, cut, da, mm; i < data.length; i += width) {
        mm = randminmax(i,i+width);
        da = Array.apply([], data.subarray(i+mm[0],i+mm[1]));
        da.sort(numericSort);
        try{
            data.set(da,i+mm[0]-1);
        }catch(e){
           console.log(e,i+mm[0],i+mm[1]);
        }
    }
    imageData.data.set(data);
    return imageData;
}


function XYtemplate(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
        width = imageData.width, height = imageData.height;
    for(var y = 0; y < height; ++y){
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
    for(var i = 0, row; i < data.length; i += width) {
        row = Array.apply([], data.subarray(i,i+width));
        /* do stuff to an array of 32bit pixels */
        for(var j = 0, l = row.length; j < l; j++){
            row[j] = ~ row[j] | 0xFF000000;
        }
        data.set(row,i);
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

function focusImage(imageData) {
    var data = imageData.data,
    height = imageData.height,
    width = imageData.width,
    pixelation = 5;
    for (var y = 0; y < height; y += pixelation) {
        for (var x = 0; x < width; x += pixelation) {
            var i = 4 * (y * width + x);
            for (var n = 0; n < pixelation; n++) {
                for (var m = 0; m < pixelation; m++) {
                    if (x + m < width) {
                        var j = ((width * (y + n)) + (x + m)) * 4;
                        data[j] = data[i];
                        data[j + 1] = data[i + 1];
                        data[j + 2] = data[i + 2];
                    }
                }
            }
        }
    }
    return imageData;
}

function slice(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data,
    cutend = Math.floor((Math.random() * (width * height * 4))),
    cutstart = Math.floor(cutend / 1.7),
    cut = data.subarray(cutstart, cutend);
    data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
    imageData.data.set(data);
    return imageData;
}

function slice2(imageData) {
    var width = imageData.width,
    height = imageData.height,
    data = imageData.data;
    for (var i = 0, l = (Math.random() * 11); i < l; i++) {
        var cutend = Math.random() < 0.75 ? Math.floor(Math.random() * (width * height * 4)) : (width * height * 4),
        cutstart = Math.floor(cutend / 1.7),
        cut = data.subarray(cutstart, cutend);
        //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
        data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
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
        data.set(cut, Math.floor(Math.random() * ((width * height * 4)-cut.length)));
        //data.set(cut, Math.floor(Math.random() * (width * height * 2)));
    }
    imageData.data.set(data);
    return imageData;
}
function slicesort(imageData) {
    var width = imageData.width,
        height = imageData.height,
        data = new Uint32Array(imageData.data.buffer),
        mm = slice_range(width,height),
        cut = new Array(data.subarray(mm[0], mm[1])),
	offset = Math.floor(Math.random() * ((width * height)-cut.length));
    cut.sort(numericSort);
    data.set(cut, offset);
    imageData.data.set(data);
    return imageData;
}

function superShift(imageData) {
    for (var i = 0, l = (Math.random() * 10) + 1; i < l; i++) {
        imageData = colorShift(imageData);
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

function fractalGhosts(imageData) {
    var data = imageData.data;
    for (var i=0; i < data.length; i++){
        if (parseInt(data[i*2%data.length],10) < parseInt(data[i],10)){
            data[i] = data[i*2%data.length];
        }
    }
    imageData.data = data;
    return imageData;
}
function fractalGhosts2(imageData) {
    var data = imageData.data,
    rand = 1 + Math.floor(Math.random() * 11);
    for (var i=0; i < data.length; i++){
        var tmp = (i * rand) % data.length;
        if (parseInt(data[tmp],10) < parseInt(data[i],10)){
            data[i] = data[tmp];
        }
    }
    imageData.data = data;
    return imageData;
}

function fractalGhosts3(imageData) {
    var data = imageData.data,
    rand = 1 + Math.floor(Math.random() * 11);
    for (var i=0; i < data.length; i++){
        if ((i%4)===0) continue;
        var tmp = (i * rand) % data.length;
        if (parseInt(data[tmp],10) < parseInt(data[i],10)){
            data[i] = data[tmp];
        }
    }
    imageData.data = data;
    return imageData;
}

function shortbettersort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
    mm = slice_range(imageData.width,imageData.height),
    sub = data.subarray(mm[0],mm[1]),
    da = Array.apply( [], sub);
    da.sort(numericSort);
    imageData.data.set(da,mm[0]);
    return imageData;
}
function shortdumbsort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
    mm = slice_range(imageData.width,imageData.height),
    sub = data.subarray(mm[0],mm[1]),
    da = Array.apply( [], sub);
    da.sort();
    imageData.data.set(da,mm[0]);
    return imageData;
}
function AnyShortSort(imageData){
    var opt = Math.floor(Math.random() * 1001) % 3;
    if(opt==1){
        return shortdumbsort(imageData);
    } else if(opt==2){
        return shortbettersort(imageData);
    } else {
        return shortsort(imageData);
    }
}

function sort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
    mm = randminmax(0,data.length),
    sub = data.subarray(mm[0],mm[1]),
    da = Array.apply( [], sub);
    da.sort(function(a,b){return (a-b)/4 - (a-b)/2;});
    //bitwise produces some cool stuff, but generally crashes my browser :(
    //da.sort(function(a,b){return a^b;});
    //da.sort(function(a,b){return a|b;});
    imageData.data.set(da,mm[0]);
    return imageData;
}
function bettersort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
    mm = randminmax(0,data.length),
    sub = data.subarray(mm[0],mm[1]),
    da = Array.apply( [], sub);
    da.sort(numericSort);
    imageData.data.set(da,mm[0]);
    return imageData;
}
function dumbsort(imageData) {
    var data = new Uint32Array(imageData.data.buffer),
    mm = randminmax(0,data.length),
    sub = data.subarray(mm[0],mm[1]),
    da = Array.apply( [], sub);
    da.sort();
    imageData.data.set(da,mm[0]);
    return imageData;
}
function AnySort(imageData){
    var opt = Math.floor(Math.random() * 1001) % 3;
    if(opt==1){
        return dumbsort(imageData);
    } else if(opt==2){
        return bettersort(imageData);
    } else {
        return sort(imageData);
    }
}
function invert(imageData) {
    var data = new Uint32Array(imageData.data.buffer);
    for(var i=0;i<data.length;i++){
            data[i] = ~ data[i] | 0xFF000000;
    }
    imageData.data.set(data.buffer);
    return imageData;
}
function rgb_glitch(imageData) {
    var data = imageData.data,
    width = imageData.width,
    height = imageData.height,
    mm = randminmax(10,width-10),
    opt = mm[1] % 3,
    dir = Math.random() > 0.5 ? true : false;
    for (y=0; y<height; y++) {
        for (x=0; x<width; x++) {
            var index = ((width * y) + x) * 4,
            red = data[index],
            green = data[index + 1],
            blue = data[index + 2];
            if(dir){
                if (opt===0){
                    data[index + mm[0]] = red;
                    data[index + mm[0]] = green;
                    data[index] = blue;
                }else if(opt===1){
                    data[index] = red;
                    data[index + mm[0]] = green;
                    data[index + mm[0]] = blue;
                } else {
                    data[index + mm[0]] = red;
                    data[index] = green;
                    data[index + mm[0]] = blue;
                }
            }else{
                if (opt===0){
                    data[index - mm[0]] = red;
                    data[index - mm[0]] = green;
                    data[index] = blue;
                }else if(opt===1){
                    data[index] = red;
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
    imageData.data = data;
    return imageData;
}
function DrumrollVerticalWave(imageData) {
    /* borrowed from https://github.com/ninoseki/glitched-canvas & modified w/ cosine */
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
    /* borrowed from https://github.com/ninoseki/glitched-canvas & modified  with cosine */
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

/* global arrays of functions */
var exp = [AnySort,AnyShortSort,shortsort,shortbettersort,shortdumbsort,sort,bettersort,dumbsort,fractalGhosts3,DrumrollHorizontalWave,DrumrollVerticalWave,slicesort,sortRows,randomSortRows,orSortRows,andSortRows,pixelSort,templateTest],
    orig = [focusImage, rgb_glitch,invert, slice, slice2, slice3,sliceB, sliceB2, sliceB3, fractalGhosts, fractalGhosts2, DrumrollHorizontal, DrumrollVertical, ditherBitshift, colorShift, ditherRandom, ditherRandom2, ditherBayer, ditherBayer3, redShift, greenShift, blueShift, superShift, superSlice, superSlice2, ditherAtkinsons, ditherFloydSteinberg, ditherHalftone, dither8Bit];

/* these run random set of functions */

function theWorks(imageData) {
    var functions = document.getElementById("experimental").checked ? orig.concat(exp) : orig.slice(0),
    sortCounter = 0;
    functions.sort(function() {
        return 0.5 - Math.random();
    });
    for (var i = 0, l = functions.length, s = 0; i < l; i++) {
        s = functions[i].name.indexOf("ort");
        if(!(s >= 0) && sortCounter >= 1){imageData = functions[i](imageData);continue;}
        if(s){sortCounter++;}
    }
    return imageData;
}

function randomGlitch(imageData) {
    var functions = document.getElementById("experimental").checked ? orig.concat(exp) : orig.slice(0),
    history = [],
    sortCounter = 0;
    for (var i = 0, s = 0, fun = 0, l = Math.floor(Math.random() * functions.length - 10)+1; i < l; i++) {
        s = functions[i].name.indexOf("ort");
        if(!(s >= 0) && sortCounter >= 1){
            fun = Math.floor(Math.random() * functions.length);
            imageData = functions[fun](imageData);
            history.push(functions[fun].name);
            continue;
        }
        if(s){sortCounter++;}
    }
    if(history.length===0){
        return randomGlitch(imageData);
    }
    console.log("randomGlitch history:",history);
    return imageData;
}

function glitch(imageData) {
    var hist = [];
    for (var i = 0, l = Math.floor(Math.random() * 5) + 5; i < l; i++) {
        switch (Math.floor(Math.random() * 13)) {
            case 0:
                imageData = focusImage(imageData);
            hist.push("focusImage");
            break;
            case 1:
                imageData = ditherBitshift(imageData);
            hist.push("ditherBitshift");
            break;
            case 2:
                imageData = (Math.random() > 0.5) ? superSlice(imageData) : superSlice2(imageData);
            hist.push("superSlice/2");
            break;
            case 3:
                imageData = colorShift(imageData);
            hist.push("colorShift");
            break;
            case 4:
                imageData = ditherRandom2(imageData);
            hist.push("ditherRandom2");
            break;
            case 5:
                imageData = ditherBayer3(imageData);
            hist.push("ditherBayer3");
            break;
            case 6:
                imageData = ditherAtkinsons(imageData);
            hist.push("ditherAtkinsons");
            break;
            case 7:
                imageData = ditherFloydSteinberg(imageData);
            hist.push("ditherFloydSteinberg");
            break;
            case 8:
                imageData = ditherHalftone(imageData);
            hist.push("ditherHalftone");
            break;
            case 9:
                imageData = dither8Bit(imageData);
            hist.push("dither8bit");
            break;
            case 10:
                if (Math.random() > 0.5) {
                var picker = Math.floor(Math.random() * 3);
                if (picker == 1) {
                    imageData = redShift(imageData);
                    hist.push("redShift");
                } else if (picker == 2) {
                    imageData = greenShift(imageData);
                    hist.push("greenShift");
                } else {
                    imageData = blueShift(imageData);
                    hist.push("blueShift");
                }
            }
            break;
            /*
               case 11:
               imageData = (Math.random()>0.5) ? fractalGhosts(imageData) : fractalGhosts2(imageData);
               hist.push("fractalGhosts/2");
               break;
               */
            default:
            imageData = invert(imageData);
            hist.push("invert");
            break;
        }
    }
    console.log("glitch history",hist);
    return imageData;
}
var seqCounter = 0;
function seqGlitch(imageData) {
    var functions = document.getElementById("experimental").checked ? orig.concat(exp) : orig.slice(0),
        i = seqCounter%functions.length;
    seqCounter++;
    console.log("seqGlitch", functions[i].name,seqCounter);
    return functions[i](imageData);
}
/*
   function testImage(imageData){
   var data = imageData.data;
   alert(avg(data));
   }
*/
