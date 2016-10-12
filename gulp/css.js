var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('css', function() {
    return gulp.src(['public/assets/sass/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('watch:css', ['css'], function() {
    gulp.watch('/sass/**/*.scss', ['css']);
});
