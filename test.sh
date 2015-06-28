#!/bin/bash
funs[0]="pixelate"
funs[1]="fractalGhosts"
funs[2]="fractalGhosts2"
funs[3]="fractalGhosts3"
funs[4]="slice"
funs[5]="dither8bit"
funs[6]="shortSort"
funs[7]="sort"
funs[8]="sliceSort"
funs[9]="sortRows"
funs[11]="rgbGlitch"
funs[12]="invert"
funs[13]="redShift"
funs[14]="greenShift"
funs[15]="blueShift"
funs[16]="superShift"
funs[17]="ditherRandom"
funs[18]="ditherRandomColor"
funs[19]="ditherBitshift"
funs[20]="ditherShuffle"

for fun in ${funs[@]}
do
  rm -f "./examples/$fun\.png"
  node main.js $fun
done

git status --porcelain | cut -b 13-
