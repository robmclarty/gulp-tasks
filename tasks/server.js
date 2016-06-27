'use strict';

const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

// Resource API server.
gulp.task('server', function (done) {
  nodemon({
    script: './bin/www',
    nodeArgs: ['--harmony_destructuring'],
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  });

  done();
});
