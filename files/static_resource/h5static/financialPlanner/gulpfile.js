var gulp=require("gulp"),uglify=require("gulp-uglify"),concat=require("gulp-concat"),rename=require("gulp-rename");gulp.task("revison",function(){gulp.src(["js/public/jquery.js","js/public/appointment.js","js/revision/revision-appointment.js"]).pipe(concat("revision.js")).pipe(gulp.dest("js"))}),gulp.task("default",function(){gulp.watch(["js/revision/*.js","js/public/appointment.js"],["revison"])});