'use strict';

module.exports = {
  // These paths make certain assumptions about where your files are stored on
  // your remote server. Change as necessary. They are currently setup for
  // standard filesystem hierarchy, but feel free to use your own system.
  deploy: {
    host: process.env.SERVER_HOST || '<your-host-name>',
    appRoot: `/opt/<your-app-name>`,
    staticRoot: `/srv/opt/<your-app-name>`,
    pm2Conf: `/etc/opt/<your-app-name>/pm2.json`
  },

  // These don't need to be changed. They are just temporarily hold references
  // to the file names that need to change while the build process runs.
  rev: {
    assets: 'rev-assets-manifest.json',
    javascripts: 'rev-js-manifest.json',
    stylesheets: 'rev-css-manifest.json'
  },

  // You might want to build into a different directory (e.g., maybe one called
  // "build" or "dist" rather than "public").
  build: {
    root: './public',
    stylesheets: './public/stylesheets',
    javascripts: './public/javascripts',
    admin: './public/admin'
  }
};
