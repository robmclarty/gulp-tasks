'use strict';

module.exports = {
  // You might want to build into a different directory (e.g., maybe one called
  // "public" or "dist" rather than "build").
  build: {
    root: './build',
    stylesheets: './build/stylesheets',
    javascripts: './build/javascripts',
    client: './build/client'
  },

  // These don't need to be changed. They are just temporary hold references
  // to the file names that need to change while the build process runs.
  rev: {
    assets: 'rev-assets-manifest.json',
    javascripts: 'rev-js-manifest.json',
    stylesheets: 'rev-css-manifest.json'
  },

  // These paths make certain assumptions about where your files are stored on
  // your remote server. Change as necessary. They are currently setup for
  // standard filesystem hierarchy, but feel free to use your own system.
  deploy: {
    host: process.env.SERVER_HOST || '<your-host-name>',
    appRoot: `/opt/<your-app-name>`,
    staticRoot: `/srv/opt/<your-app-name>`,
    pm2Conf: `/etc/opt/<your-app-name>/pm2.json`
  }
};
