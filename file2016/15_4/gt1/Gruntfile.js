module.exports=function (grunt) {
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        concat: {
            gt1: {
                files:{
                    'dist/built.js': ['t1.js', 't2.js'],
                }
            }
        }
    });
}


grunt.loadNpmTasks('grunt-contrib-concat');
grunt.registerTask('default', ['concat']);