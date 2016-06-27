'use strict';

const serverConf = require('./server');

module.exports = Object.freeze({
  deploy: {
    host: process.env.SERVER_HOST || 'telus-jwt',
    appRoot: `/opt/${ serverConf.appName }`,
    staticRoot: `/srv/opt/${ serverConf.appName }`,
    pm2Conf: `/etc/opt/${ serverConf.appName }/pm2.json`
  },
  rev: {
    assets: 'rev-assets-manifest.json',
    javascripts: 'rev-js-manifest.json',
    stylesheets: 'rev-css-manifest.json'
  },
  build: {
    root: './public',
    stylesheets: './public/stylesheets',
    javascripts: './public/javascripts',
    admin: './public/admin'
  }
});
