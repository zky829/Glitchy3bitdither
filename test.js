/*
 * test.js
 * Copyright (C) 2017 jkirchartz <me@jkirchartz.com>
 *
 * Distributed under terms of the NPL (Necessary Public License) license.
 */
var gleech = require("./gleech.js");

gleech.read("test.jpg", function (err, img) {
        if (err) throw err;
        img.resize(256, 256)
           .quality(60)
           .greyscale()
           .write("test_sm.jpg");

});
