'use strict';

const sinon = require('sinon');
const mesh  = require('../../lib/mesh');

function MockNodeFactory() {
  return {
    nodeId: mesh.util.hash.md5('local' + mesh.util.random()),
    communication: {
      send: sinon.spy()
    }
  };
}

module.exports = MockNodeFactory;
