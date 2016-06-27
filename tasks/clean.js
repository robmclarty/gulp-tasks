'use strict';

const gulp = require('gulp');
const del = require('del');

const config = require('../config/gulp');

// Wipe out any existing files and folders in the ./public directory so we can
// start again fresh.
gulp.task('clean', function () {
  return del([
    `${ config.build.root }/**/*`,
    `!${ config.build.root }/.keep`
  ]);
});
