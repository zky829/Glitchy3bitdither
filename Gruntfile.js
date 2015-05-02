module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: {
//          'path/to/result.js': 'path/to/source.coffee', // 1:1 compile
          'lib/gleech.js': ['src/**.coffee', 'src/**.js']
          // compile and concat all sources into single file
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.registerTask('default', ['coffee']);


};

