/*
 * Glitch Cruiser
 * Copyleft (ↄ) 2016 kirch <kirch@arp>
 *
 * Distributed under terms of the NPL (Necessary Public License) license.
 */

function handleFileSelect(e) {
  var file = e.target.files[0];
  // Only process image files.
  if (!file.type.match('image.*')) {
    return;
  }
  var reader = new FileReader();
  // Closure to capture the file information.
  reader.onload = function(e) {
    var img = document.createElement("img");
    img.onload = function() {
      generate(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  document.getElementById("output").innerHTML = "";
}

function generate(img){
  /* cleanup */
  document.getElementById("output").innerHTML = "";
  /* setup */
  var orig = img;
  var width = img.width;
  var height = img.height;
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  /* execute */
  for (var i = 1; i < 10;i++){
    if(i==5 && typeof img == "object"){
      ctx.drawImage(orig,0,0);
      drawDitherResult2(canvas,gleech.original,"original");
      /* Original Image */
    }else{
      ctx.drawImage(img, 0, 0);
      drawDitherResult2(canvas,gleech.seqGlitch,"seqGlitch");
      /* generated from Original */
    }
  }
}
document.getElementById('output').onclick = function(e){
  if (e.target.tagName.toLowerCase() == 'img'){
    generate(e.target);
    e.preventDefault();
  }
};
document.getElementById('uploader').addEventListener('change', handleFileSelect, false);

