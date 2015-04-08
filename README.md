Glitchy 3 Bit Dither
==============

Check out the increasingly inane online <a href="http://jkirchartz.com/Glitchy3bitdither" title="Demo">Demo</a>.

<p>This is a utility to mutilate images in unpredictable ways. It can randomly choose between algorithms, and many algorithms randomly mutate themselves.
    You can choose different encodings, effects, and emulate several glitch techniques, resulting in aleatoric new images and hidden configurations.</p>
</p>
<p>Check out some curated images at <a href="http://glitches.jkirchartz.com/">glitches.jkirchartz.com</a></p>
<p>This is a node standalone version using Caman.js; I'm just getting started so 
bear with me.</p>

<p>Based on Nolan Caudill's <a href="https://github.com/mncaudill/3bitdither">3bitdither</a></p>
<p>Heavily modified by JKirchartz, <a href="https://github.com/jkirchartz/Glitchy3bitdither">code on github</a></p>
<p>Experimental functions may not be 100% stable, this is a work in progress.</p>

##Sample Code

**coming soon**

probably something like

    glitcher <input> <output> <functions(s)>


or

    
    var glitcher = require('Glitchy3bitDither');

    http.get('<img url>', function(data) {
        data.pipe(glitcher.<function>).pipe(glitcher.<function>)
    }

I'm not sure, that's just speculation.


##todo:
1. optimize code w/ better code from the row-sorting algos
2. web workers
3. namespace
4. better function names
5. better comments
6. add paremeters for granular control - but use randomness as default functionality if no params are used
7. Add Glitches:
  * scan lines (1px black line the entire width every N lines)
  * move each "row" in opposite directions (1px at a time)
  * kaleidoscope
8. nodejs/cli - for batch/bots/etc. (via [CamanJS](http://camanjs.com/))


##run locally
The demo site in this repo is a [Jekyll](http://jekyllrb.com) project, to run locally install the gem &amp; run `jekyll --serve`.
You can also use the `--auto` flag to make jekyll automatically update the site as files change.

portions under the included MIT license, copyright 2013 Matthew Nolan Caudill, as noted.
99% of the rest copyleft 2013 JKirchartz, except as noted.

hack away! huzzah!

