'use strict';

const mesh = require('./mesh');

if (!mesh.serialization[mesh.conf.serialization]) {
  throw new Error(`serialization scheme ${mesh.conf.serialization} not found`);
}

module.exports = mesh.serialization[mesh.conf.serialization];
