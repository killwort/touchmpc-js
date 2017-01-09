/// <binding AfterBuild='default' />
var gulp=require('gulp');
var less=require('gulp-less');
var _concat = require('gulp-concat');

gulp.task('css',function(){
	return gulp.src('src/*.less')
		.pipe(less())
		.pipe(_concat('main.css'))
		.pipe(gulp.dest('res'));
});

gulp.task('default', ['css']);