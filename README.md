Gleech
==============


<p>This is a utility to mutilate images in unpredictable ways. It can randomly choose between algorithms, and many algorithms randomly mutate themselves.
    You can choose different encodings, effects, and emulate several glitch techniques, resulting in aleatoric new images and hidden configurations.</p>
<p>
Check out the <a href="http://jkirchartz.com/Glitchy3bitdither" title="Demo">Web Demo</a> or some curated images at <a href="http://glitches.jkirchartz.com/">glitches.jkirchartz.com</a></p>
</p>

<p>Based on <a href="http://github.com/jkirchartz/Glitchy3bitDither">Glitchy3bitDither</a>, powered by <a href="https://github.com/meltingice/camanjs">camanjs</a></p>
<p>Experimental functions may not be 100% stable, this is a work in progress.</p>

##Sample Code

**coming soon**

probably something like

    glitcher <input> <output> <functions(s)>


or

    var g = require('Gleech');

    g.get('<img url>', function(data) {
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


copyleft 2015 JKirchartz, all rights reversed

hack away! huzzah!

