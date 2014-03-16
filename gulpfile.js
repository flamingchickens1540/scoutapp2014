var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('styles', function() {
  gulp.src('./public/css/index.styl')
    .pipe(stylus({ set:['compress'] }))
    .pipe(gulp.dest('./public/css'));
});
