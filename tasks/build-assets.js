'use strict';

const gulp = require('gulp');

const config = require('../config/gulp');

// Copy all static assets to public folder.
gulp.task('build:assets', function () {
  return gulp.src('./assets/**/*')
    .pipe(gulp.dest(config.build.root));
});

// Copy admin html file to public folder.
gulp.task('build:html', function () {
  return gulp.src('./client/index.html')
    .pipe(gulp.dest(config.build.admin));
});
