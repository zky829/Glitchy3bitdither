var caman = require('caman').Caman;
require('./lib/gleech.js')();

/* global arrays of functions */
var exp = [AnySort, AnyShortSort, shortsort, shortbettersort, shortdumbsort,
       sort, bettersort, fractalGhosts3, DrumrollHorizontalWave,
       DrumrollVerticalWave, slicesort, sortRows, randomSortRows, orSortRows,
       andSortRows, pixelSort, templateTest];
var orig = [focusImage, rgb_glitch, invert, slice, slice2, slice3, sliceB,
        sliceB2, sliceB3, fractalGhosts, fractalGhosts2, DrumrollHorizontal,
        DrumrollVertical, ditherBitshift, colorShift, ditherRandom,
        ditherRandom2, ditherBayer, ditherBayer3, redShift, greenShift,
        blueShift, superShift, superSlice, superSlice2, ditherAtkinsons,
        ditherFloydSteinberg, ditherHalftone, dither8Bit];

/* these run random set of functions */

function theWorks(imageData) {
  var functions = document.getElementById('experimental').checked ?
    orig.concat(exp) : orig.slice(0),
  sortCounter = 0;
  functions.sort(function() {
    return 0.5 - Math.random();
  });
  for (var i = 0, l = functions.length, s = 0; i < l; i++) {
    s = functions[i].name.indexOf('ort');
    if ((s <= 0) && sortCounter >= 1) {
      imageData = functions[i](imageData);
      continue;
    }
    if (s) {sortCounter++;}
  }
  return imageData;
}

function randomGlitch(imageData) {
  var functions = document.getElementById('experimental').checked ?
                  orig.concat(exp) : orig.slice(0),
  history = [],
  sortCounter = 0;
  for (var i = 0,
           s = 0,
           fun = 0,
           l = Math.floor(Math.random() * functions.length - 10) + 1;
           i < l; i++) {
    s = functions[i].name.indexOf('ort');
    if ((s <= 0) && sortCounter >= 1) {
      fun = Math.floor(Math.random() * functions.length);
      imageData = functions[fun](imageData);
      history.push(functions[fun].name);
      continue;
    }
    if (s) {sortCounter++;}
  }
  if (history.length === 0) {
    return randomGlitch(imageData);
  }
  return imageData;
}

function glitch(imageData) {
  var hist = [];
  for (var i = 0, l = Math.floor(Math.random() * 5) + 5; i < l; i++) {
    switch (Math.floor(Math.random() * 13)) {
        case 0:
        imageData = focusImage(imageData);
      hist.push('focusImage');
      break;
      case 1:
        imageData = ditherBitshift(imageData);
      hist.push('ditherBitshift');
      break;
      case 2:
        imageData = (Math.random() > 0.5) ?
                    superSlice(imageData) : superSlice2(imageData);
      hist.push('superSlice/2');
      break;
      case 3:
        imageData = colorShift(imageData);
      hist.push('colorShift');
      break;
      case 4:
        imageData = ditherRandom2(imageData);
      hist.push('ditherRandom2');
      break;
      case 5:
        imageData = ditherBayer3(imageData);
      hist.push('ditherBayer3');
      break;
      case 6:
        imageData = ditherAtkinsons(imageData);
      hist.push('ditherAtkinsons');
      break;
      case 7:
        imageData = ditherFloydSteinberg(imageData);
      hist.push('ditherFloydSteinberg');
      break;
      case 8:
        imageData = ditherHalftone(imageData);
      hist.push('ditherHalftone');
      break;
      case 9:
        imageData = dither8Bit(imageData);
      hist.push('dither8bit');
      break;
      case 10:
        if (Math.random() > 0.5) {
        var picker = Math.floor(Math.random() * 3);
        if (picker == 1) {
          imageData = redShift(imageData);
          hist.push('redShift');
        } else if (picker == 2) {
          imageData = greenShift(imageData);
          hist.push('greenShift');
        } else {
          imageData = blueShift(imageData);
          hist.push('blueShift');
        }
      }
      break;
    /*
    case 11:
    imageData = (Math.random()>0.5) ?
                 fractalGhosts(imageData) : fractalGhosts2(imageData);
    hist.push('fractalGhosts/2');
    break;
    */
      default:
      imageData = invert(imageData);
      hist.push('invert');
      break;
    }
  }
  var history = hist.join(', ');
  return imageData;
}
var seqCounter = 0;
function seqGlitch(imageData) {
  var functions = document.getElementById('experimental').checked ?
                  orig.concat(exp) : orig.slice(0),
      i = seqCounter % functions.length;
  seqCounter++;
  return functions[i](imageData);
}
/*
   function testImage(imageData){
   var data = imageData.data;
   alert(avg(data));
   }
   */
