'use strict';

const diskAdapter = require('sails-disk');
const mysqlAdapter = require('sails-mysql');

// NOTE: The database will *not* automatically migrate when the `migrate`
// attribute is set to 'safe'. In order to initialize the db, first, change
// this value to 'alter', run the server (which will auto setup the db), then
// change the value back to 'safe' (in production, this ensures that the db
// schema cannot be altered on the fly, keeping data safe). This can be set
// explicitly in the environment variables as 'MIGRATE'.
module.exports = Object.freeze({
  port: process.env.PORT || 3002,
  appName: process.env.APP_NAME || 'workforce-manager',
  token: {
    issuer: process.env.JWT_ISSUER || 'jwt-issuer',
    secret: process.env.JWT_SECRET || 'my_super_secret_secret'
  },
  database: {
    adapters: {
      'default': diskAdapter,
      'disk': diskAdapter,
      'mysql': mysqlAdapter
    },
    connections: {
      'local-disk': {
        adapter: 'disk'
      },
      'local-mysql': {
        adapter: 'mysql',
        url: process.env.DATABASE || 'mysql://root@localhost:3306/jwt-workforce'
      }
    },
    defaults: {
      migrate: process.env.MIGRATE || 'alter'
    }
  }
});
