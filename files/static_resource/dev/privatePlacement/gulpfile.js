var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	rename = require("gulp-rename");

//合并私募js

gulp.task("simu", function(){
	gulp.src(['js/public/jquery.js',
			'js/public/modalJs.js',
			'js/public/flexible.js',
			'js/risk/risk.js',
			'js/public/iscroll-probe.js',
			'js/privateplacement/*.js',
			'!js/privateplacement/watermark.js',
			'!js/privateplacement/popupRedirect.js',
			'!js/privateplacement/riskTips.js'

	])
		.pipe(concat('simu.js'))
		.pipe(gulp.dest('js'))
});
//监听
gulp.task("default",function(){
	gulp.watch('js/privateplacement/*.js',['simu']);
});