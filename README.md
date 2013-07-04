Glitchy 3 Bit Dither
==============
Implemented by Nolan Caudill, "Enhanced" by JKircharz

<p>Originally, Nolan Caudill's demo used two different error-diffusion dithering algorithms: <a href="http://verlagmartinkoch.at/software/dither/index.html">Atkinson's</a> and the <a href="http://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering">Floyd-Steinberg</a>. Now it does more. So much more. ( Insert maniacal laughter )

<p>This runs completely client-side, using the FileReader and canvas APIs. If you have a decent browser, this could work. Also, you can right-click and save the result of the processing.</p>

The demo lives <a href="http://jkirchartz.com/Glitchy3bitdither/">here</a>.

To see some curated images check out <http://glitches.jkirchartz.com/>


##Sample Code

    // setup canvas
    var canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    var ctx = canvas.getContext('2d');

    // draw some red circles with black outlines
    for (var i = 0; i < 12; i++) {
        var centerX = Math.floor(Math.random() * 500) + 10;
        var centerY = Math.floor(Math.random() * 500) + 10;
        var radius = Math.floor(Math.random() * 50) + 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
    }
    // get data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // apply a corruption to an image
    ctx.putImageData(glitch(imageData), 0, 0);
    var out = document.createElement('img');
    // send output to img element on the page
    out.src = canvas.toDataURL("image/png");
    document.body.appendChild(out);
