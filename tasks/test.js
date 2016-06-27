'use strict';

const gulp = require('gulp');
const eslint = require('gulp-eslint');

gulp.task('lint', function () {
  return gulp
    .src([
      './server/**/*.js',
      './admin/**/*+(js|jsx)'
    ])
    .pipe(eslint())
    .pipe(eslint.format());
});
