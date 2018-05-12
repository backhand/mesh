'use strict';

/* Module imports */
const log4js = require('log4js');
const mesh   = require('./mesh');

/* Module init */
log4js.configure({
  appenders: {
    console: {
      type: 'console'
    }
  },
  categories: {
    default: {
      appenders: ['console'],
      level: mesh.conf.logLevel
    }
  }
});

/* Module init */
const logger = log4js.getLogger();

/* Module exports */
module.exports = logger;
