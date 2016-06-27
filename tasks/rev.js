'use strict';

const gulp = require('gulp');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');

const config = require('../config/gulp');

// Apply rev hashes to all static asset file names for cache busting.
gulp.task('rev:assets', function () {
  return gulp
    .src('./assets/**/*')
    .pipe(rev())
    .pipe(gulp.dest(config.build.root))
    .pipe(rev.manifest(config.rev.assets))
    .pipe(gulp.dest(config.build.root));
});

// Apply rev hashes to all javascript files. This task assumes there is already
// existing javascript files built in the ./public/javascripts folder.
gulp.task('rev:js', function () {
  const manifest = gulp.src(`${ config.build.root }/${ config.rev.assets }`);

  return gulp
    .src(`${ config.build.javascripts }/**/*.js`)
    .pipe(revReplace({ manifest: manifest }))
    .pipe(rev())
    .pipe(gulp.dest(config.build.javascripts))
    .pipe(rev.manifest(config.rev.javascripts))
    .pipe(gulp.dest(config.build.root));
});

// Apply rev hashes to all css files. This task assumes there is already
// existing css files built in the ./public/stylesheets folder.
gulp.task('rev:css', function () {
  const manifest = gulp.src(`${ config.build.root }/${ config.rev.assets }`);

  return gulp
    .src(`${ config.build.stylesheets }/**/*.css`)
    .pipe(revReplace({ manifest: manifest }))
    .pipe(rev())
    .pipe(gulp.dest(config.build.stylesheets))
    .pipe(rev.manifest(config.rev.stylesheets))
    .pipe(gulp.dest(config.build.root));
});

// Copy the html file for the admin client app and replace references to js
// and css which have been adjusted with rev. This is done in a second step
// so that each individual js and css file can include its own rev-replace step
// before being revved itself (which would change the hash) and finally included
// in the html here. This allows for diffs in the js/css files in cases where
// the code itself has not changed, but a static asset being referenced has.
gulp.task('rev:html', function () {
  const jsManifest = gulp.src(`${ config.build.root }/${ config.rev.javascripts }`);
  const cssManifest = gulp.src(`${ config.build.root }/${ config.rev.stylesheets }`);

  return gulp
    .src(`${ config.build.admin }/**/*.html`)
    .pipe(revReplace({ manifest: jsManifest }))
    .pipe(revReplace({ manifest: cssManifest }))
    .pipe(gulp.dest(config.build.admin));
});
