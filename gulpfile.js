'use strict';

// NOTE: This file depends on gulp and gulp-cli v4.0
//
// References:
// https://github.com/gulpjs/gulp/tree/4.0
// http://blog.reactandbethankful.com/posts/2015/05/01/how-to-install-gulp-4/
// https://gist.github.com/demisx/beef93591edc1521330a
// http://fettblog.eu/gulp-4-parallel-and-series/
// https://blog.wearewizards.io/migrating-to-gulp-4-by-example
const gulp = require('gulp');
const argv = require('yargs').argv;
const requireDir = require('require-dir');

// Require all tasks.
requireDir('./tasks', { recurse: true });

// Set NODE_ENV to 'production'. Used when compiling React for production mode.
// If not set to production env, React will perform additional checks and
// validations and output errors and warnings to the console, and thus also
// perform slower.
function setProductionEnv(done) {
  process.env.NODE_ENV = 'production';

  return done();
}

function watch() {
  gulp.watch('styles/**/*', gulp.parallel('build:styles'));
  gulp.watch('client/**/*', gulp.parallel('build:client', 'build:html'));
  gulp.watch('assets/**/*', gulp.parallel('build:assets'));
}
watch.description = 'Watch variable folders for changes and rebuild if necessary.';
gulp.task(watch);

// Build for production (include minification, revs, etc.).
const buildProduction = gulp.series(
  'clean',
  setProductionEnv,
  gulp.parallel(
    'build:vendors',
    'build:admin',
    'build:styles',
    'build:assets',
    'build:html'
  ),
  'rev:assets',
  gulp.parallel('rev:js', 'rev:css'),
  'rev:html'
);

// Build for development (include React dev, no revs, no minification, etc.).
const buildDevelopment = gulp.series(
  'clean',
  gulp.parallel(
    'build:vendors',
    'build:admin',
    'build:styles',
    'build:assets',
    'build:html'
  )
);

// Choose between building for dev or production based on --production flag.
function build(done) {
  if (argv.production) {
    buildProduction();
  } else {
    buildDevelopment();
  }

  return done();
}
build.description = 'Build all the things!';
build.flags = {
  '--production': 'Builds in production mode (minification, revs, etc.).'
};
gulp.task(build);

// Deploy to server.
// Takes one parameter "host" which is the SSH host+credentials for the server.
// gulp deploy --host my-host
function deploy() {
  if (argv.host) process.env.SERVER_HOST = argv.host;

  return gulp.series(
    buildProduction,
    'deploy:assets',
    'deploy:server',
    'deploy:reload'
  );
}
deploy.description = 'Build for production and deploy to server, restarting the server when finished.';
deploy.flags = {
  '--host': 'Sets the host to where the server you want to deploy to is located.'
};
gulp.task(deploy);

gulp.task('default', gulp.series(build, 'server', watch));
