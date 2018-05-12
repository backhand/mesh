'use strict';

/* Module imports */
const mesh = require('./mesh');

/* Module init */
if (!mesh.serialization[mesh.conf.serialization]) {
  throw new Error(`serialization scheme ${mesh.conf.serialization} not found`);
}

/* Module exports */
module.exports = mesh.serialization[mesh.conf.serialization];
