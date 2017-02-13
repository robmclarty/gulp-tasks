'use strict';

const gulp = require('gulp');
const rsync = require('gulp-rsync');
const argv = require('yargs').argv;
const spawn = require('child_process').spawn;

const config = require('../config/gulp');
const serverConf = require('../config/server');
const spawnConf = { cwd: config.deploy.appRoot, env: process.env };

const bufferToString = data => {
  const buff = new Buffer(data);
  return buff.toString('utf8');
};

const concatCommands = (acc, cmd) => {
  return acc ? `${ acc } && ${ cmd }` : cmd;
};

// Copy static assets to server.
// `hostname` is actually the SSH symbol used in ~/.ssh/config
gulp.task('deploy:assets', function () {
  const serverHost = argv.host || process.env.SERVER_HOST || config.deploy.host;
  const rsyncConf = {
    root: 'public',
    hostname: serverHost,
    destination: config.deploy.staticRoot,
    progress: true,
    recursive: true,
    clean: true,
    exclude: [
      '*.map',
      config.rev.assets,
      config.rev.javascripts,
      config.rev.stylesheets
    ]
  };

  return gulp.src('./public/**')
    .pipe(rsync(rsyncConf));
});

// Copy all files in /server as well as npm package manifest.
gulp.task('deploy:server', function () {
  const serverHost = argv.host || process.env.SERVER_HOST || config.deploy.host;
  const rsyncConf = {
    hostname: serverHost,
    destination: config.deploy.appRoot,
    progress: true,
    recursive: true,
    clean: true
  };

  return gulp.src([
      './server/**',
      './config/server.js',
      './bin/www',
      'package.json'
    ])
    .pipe(rsync(rsyncConf));
});

// Install npm dependencies and restart pm2 process on remote server over SSH.
//
// References:
// ssh remote commands in quotes using spawn - http://stackoverflow.com/questions/27670686/ssh-with-nodejs-child-process-command-not-found-on-server
// npm flags - https://docs.npmjs.com/misc/config
// child_process docs - https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
// stdio options - https://nodejs.org/api/child_process.html#child_process_options_stdio
gulp.task('deploy:reload', function (done) {
  const remoteCommandList = [
    `cd ${ config.deploy.appRoot }`,
    'npm install --production --loglevel info',
    `pm2 reload ${ config.deploy.pm2Conf }`
  ];
  const remoteCommands = remoteCommandList.reduce(concatCommands, '');
  const proc = spawn('ssh', [config.deploy.host, remoteCommands], { stdio: 'inherit' });

  proc.on('exit', function (code) {
    if (code !== 0) {
      console.log(`restart process exited with code ${ code }`);
      return;
    }

    console.log('@@@@ server reloaded successfully :)');
  });

  done();
});
