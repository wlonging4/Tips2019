var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require("gulp-rename");

//合并私募js

gulp.task("revison", function(){
	gulp.src(['js/public/jquery.js',
			'js/public/appointment.js',
			//'js/public/flexible.js',
			'js/revision/revision-appointment.js'

		])
		.pipe(concat('revision.js'))
		.pipe(gulp.dest('js'))
});
//监听
gulp.task("default",function(){
	gulp.watch(['js/revision/*.js','js/public/appointment.js'],['revison']);
});