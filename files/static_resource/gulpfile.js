var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	concat = require('gulp-concat'),
	htmlmin = require('gulp-htmlmin'),
	rename = require("gulp-rename"),
	replace = require("gulp-replace"),
	runSequence = require('run-sequence'),
	clean = require('gulp-clean'),
	webpack = require("webpack"),
    webpackStream = require('webpack-stream');
	// webpackConfig = require("./webpack.config.prod");
var today = new Date(),
    version = today.getFullYear().toString() + (today.getMonth()+1).toString() + today.getDate().toString() + parseInt(Math.random()*10000);
var distdir = 'h5static/';
var cdn = 'https://cdn.com';
gulp.task("minifyCss",function(){
	return gulp.src(['dev/**/*.css', "!dev/planner/**/*.css"])
        .pipe(replace(/.png\"/g,".png?"+version+"\""))
        .pipe(replace(/.jpg\"/g,".jpg?"+version+"\""))
        .pipe(replace(/.gif\"/g,".gif?"+version+"\""))
        .pipe(replace(/.png\)/g,".png?"+version+")"))
        .pipe(replace(/.jpg\)/g,".jpg?"+version+")"))
        .pipe(replace(/.gif\)/g,".gif?"+version+")"))
		.pipe(minifyCss())
		.pipe(gulp.dest(distdir));
});
gulp.task("minyImg",function(){
	return gulp.src(["dev/**/*.png","dev/**/*.jpg","dev/**/*.gif","dev/**/*.ico", "!dev/app/**/*.png","!dev/app/**/*.jpg","!dev/app/**/*.gif","!dev/app/**/*.ico"])
	.pipe(imagemin({
		progressive : true,
		use : [pngquant()]
	}))
	.pipe(gulp.dest(distdir));
});
gulp.task('minfyJs',function(){
	return gulp.src(['dev/**/*.js', '!dev/app/**/*.js'])
	.pipe(uglify())
	.pipe(gulp.dest(distdir));
});
gulp.task('font',function () {
	return gulp.src(['dev/**/*.eot','dev/**/*.svg','dev/**/*.ttf','dev/**/*.woff','!dev/app/**/*.eot','!dev/app/**/*.svg','!dev/app/**/*.ttf','!dev/app/**/*.woff'])
		.pipe(gulp.dest(distdir));
})
gulp.task('cleanAll',function(){
	return gulp.src([distdir],{read:false})
		.pipe(clean());
});
gulp.task('htmlminJs',function(){
	var options = {
		removeComments: true, //清除html注释
		collapseWhitespace: true, //压缩html
		minfyJS: true,//压缩JS
		minfyCss: true,//压缩CSS
	};
	gulp.src(['dev/**/*.html','!dev/**/pages/*.html','!dev/app/**/*.html'])
        .pipe(replace(".css",".css?"+version))
        .pipe(replace(".js",".js?"+version))
		.pipe(htmlmin(options))
		.pipe(gulp.dest(distdir));
});


/**
 * 清除 引入的webpack.config.prod缓存
 * 多个webpack任务 缓存容易干扰 打包生成的工程目录
 * **/
gulp.task("clean[webpack-cache]",['clean[activity]'], function () {
    delete require.cache[require.resolve('./webpack.config.prod')]

});
/**
 * 理财师任务
 * **/
gulp.task('clean[planner]',function(){
    return gulp.src([distdir + "app/planner"],{read:false})
        .pipe(clean());
});
gulp.task("webpack[planner]",['clean[planner]'], function () {
    console.log("webpack[planner] 打包开始 start-------")
    process.env.project = "planner";
    let config = require("./webpack.config.prod");
	return gulp.src(["dev/app/planner/**/*.js"])
		.pipe(webpackStream(config, webpack)).pipe(gulp.dest(distdir + "app/planner"))

});
/**
 * 出借人任务
 * **/
gulp.task('clean[lender]',function(){
    return gulp.src([distdir + "app/lender"],{read:false})
        .pipe(clean());
});
gulp.task("webpack[lender]",['clean[lender]'], function () {
    console.log("webpack[planner] 打包开始 start-------")
    process.env.project = "lender";
    let config = require("./webpack.config.prod");
    return gulp.src(["dev/app/lender/**/*.js"])
        .pipe(webpackStream(config, webpack)).pipe(gulp.dest(distdir + "app/lender"))
});
/**
 * 活动页面任务
 * **/
gulp.task('clean[activity]',function(){
    return gulp.src([distdir + "app/activity"],{read:false})
        .pipe(clean());
});
gulp.task("webpack[activity]",['clean[activity]'], function () {
    console.log("webpack[activity] 打包开始 start-------")
    process.env.project = "activity";
    let config = require("./webpack.config.prod");
    return gulp.src(["dev/app/activity/**/*.js"])
        .pipe(webpackStream(config, webpack)).pipe(gulp.dest(distdir + "app/activity"))

});

/**
 * 发布 非app文件夹的任务
 * **/
gulp.task('publish', ['cleanAll'], function() {
    return gulp.start('minifyCss', 'minyImg', 'minfyJs', 'htmlminJs','font');
});
/**
 * 新的发布任务
 * **/
gulp.task("newPublish", ['publish'],function () {
    runSequence("webpack[planner]", 'clean[webpack-cache]', "webpack[activity]");
});
gulp.task('replaceTest', function(){
    gulp.src(['dev/webchat/fundTalk.html'])
        .pipe(replace(/\<script\/?[^\<\>]+\>/gi, function(match, p1, offset, string) {
        	var re = match.match(/(?<=src=").*?(js")/gi);
        	if(re){
                var src = re[0],result = cdn;
                if(typeof src === 'string'){
                    let srcArr = src.substr(0,src.length-1).split('/');
                    for(let i = 0;i<srcArr.length;i++){
                        if(srcArr[i] !== '..'){
                            result += '/'+srcArr[i];
                        }
                    }
                }
                result += '?'+version+'"';
                return match.replace(src,result);
			}
        }))
        .pipe(replace(/\<link\/?[^\<\>]+\>/gi, function(match, p1, offset, string) {
        	var re = match.match(/(?<=href=").*?(css")/gi);
        	if(re){
        		var src = re[0],result = cdn;
                if(typeof src === 'string'){
                    let srcArr = src.substr(0,src.length-1).split('/');
                    for(let i = 0;i<srcArr.length;i++){
                        if(srcArr[i] !== '..'){
                            result += '/'+srcArr[i];
                        }
                    }
                }
                result += '?'+version+'"';
                return match.replace(src,result);
			}
        }))
        .pipe(replace(/\<img\/?[^\<\>]+\>/gi, function(match, p1, offset, string) {
            var re = match.match(/(?<=src=").*?(png"|jpg"|gif")/gi);
            if(re){
                var src = re[0],result = cdn;
                if(typeof src === 'string'){
                    let srcArr = src.substr(0,src.length-1).split('/');
                    for(let i = 0;i<srcArr.length;i++){
                        if(srcArr[i] !== '..'){
                            result += '/'+srcArr[i];
                        }
                    }
                }
                result += '?'+version+'"';
                return match.replace(src,result);
            }
        }))
        .pipe(gulp.dest('build/'));
});