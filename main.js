var gleech = require('./lib/gleech').gleech;

gleech('./examples/Lenna.png', function() {
  this.pixelate();
  this.render(function() {
    this.save('./examples/output.png');
  });
});
