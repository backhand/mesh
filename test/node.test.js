'use strict';

const sinon  = require('sinon');
const mesh   = require('../lib/mesh');
const assert = require('assert');

describe('node', function() {
  const config = {
    groupName: 'testgroup',
    discovery: {
      scheme: 'local'
    },
    communication: {
      scheme: 'local'
    }
  };
  const config2 = {
    groupName: 'anothergroup',
    discovery: {
      scheme: 'local'
    },
    communication: {
      scheme: 'local'
    }
  };

  let node1;
  let node2;
  let node3;
  before(async () => {
    node1 = mesh.node.init(config);
    node2 = mesh.node.init(config);
    node3 = mesh.node.init(config2);
    await mesh.util.sleep(2500);
  });

  describe('factory', function() {
    it('should create a new node', async function() {
      // const node = mesh.node.init(config)

      // Check configuration
      assert.ok(node1.configuration);
      assert.ok(node2.configuration);
      assert.ok(node3.configuration);

      // Check there's a node id
      assert.ok(node1.nodeId);
      assert.ok(node2.nodeId);
      assert.ok(node3.nodeId);

      // Check network binding
      assert.ok(node1.binding);
      assert.ok(node2.binding);
      assert.ok(node3.binding);

      // Check communication settings
      assert.equal(node1.discoveryScheme, config.discovery.scheme);
      assert.equal(node2.discoveryScheme, config.discovery.scheme);
      assert.equal(node3.discoveryScheme, config2.discovery.scheme);

      // Check discovery settings
      assert.equal(node1.discoveryScheme, config.discovery.scheme);
      assert.equal(node2.discoveryScheme, config.discovery.scheme);
      assert.equal(node3.discoveryScheme, config2.discovery.scheme);
      
      // Check group
      assert.equal(node1.group.name, config.groupName);
      assert.equal(node2.group.name, config.groupName);
      assert.equal(node3.group.name, config2.groupName);
    });
  }); // End describe factory

  describe('discovery', function() {
    it('should have found some friends', async function() {
      // node1 and 2 should have one each, node 3 is all alone
      assert.equal(Object.keys(node1.group.peers).length, 1);
      assert.equal(Object.keys(node2.group.peers).length, 1);
      assert.equal(Object.keys(node3.group.peers).length, 0);
      
    });
  }); // End describe discovery
}); // End describe node
