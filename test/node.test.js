'use strict';

const sinon  = require('sinon');
const mesh   = require('../lib/mesh');
const assert = require('assert');

describe('node', function() {
  const config = {
    logLevel: 'error',
    groupName: 'testgroup',
    discovery: {
      interval: 1000,
      scheme: 'local'
    },
    communication: {
      scheme: 'local'
    }
  };
  const config2 = {
    groupName: 'anothergroup',
    discovery: {
      interval: 1000,
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

    await mesh.util.sleep(2000);
  });

  describe('factory', function() {
    it('should create a new node', async function() {
      // Check configuration
      assert.ok(node1.configuration);
      assert.deepEqual(node1.configuration, {
        groupName: 'testgroup',
        serialization: 'json',
        logLevel: 'error',
        discovery: {
          interval: 1000,
          scheme: 'local',
          udp: {
            port: 9999
          },
          redis: {
            host: '10.0.0.2',
            port: 6379,
            channel: 'mesh'
          }
        },
        communication: {
          scheme: 'local',
          tcp: {
            port: 12431
          }
        }
      });
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

  describe('info', function() {
    it('should return information on the node', function() {
      assert.deepEqual(node1.info(), {
        nodeId:         node1.nodeId,
        group:          node1.group.name,
        discovery:      node1.discoveryScheme,
        communication:  node1.communicationScheme,
        address:        node1.communication.getAddress()
      });
    });
  }); // End describe info

  describe('getSearchMessage', function() {
    it('should return information node for pinging', function() {
      assert.deepEqual(node1.info(), {
        nodeId:         node1.nodeId,
        group:          node1.group.name,
        discovery:      node1.discoveryScheme,
        communication:  node1.communicationScheme,
        address:        node1.communication.getAddress()
      });
    });
  }); // End describe getSearchMessage

  describe('onDiscovery', function() {
    it('should add a peer node to the group list if in same group', function() {
      const nodeInfo = {
        nodeId:         'faker',
        group:          node1.group.name,
        discovery:      node1.discoveryScheme,
        communication:  node1.communicationScheme,
        address:        node1.communication.getAddress()
      };
      assert.equal(Object.keys(node1.group.peers).length, 1);
      node1.onDiscovery(nodeInfo);
      assert.equal(Object.keys(node1.group.peers).length, 2);
      assert.deepEqual(node1.group.peers[nodeInfo.nodeId], nodeInfo);
      node1.group.dropPeerNode(nodeInfo.nodeId);
      assert.equal(Object.keys(node1.group.peers).length, 1);
    });
  }); // End describe onDiscovery
  // onPeerMessage

  describe('discovery', function() {
    it('should have found some friends', async function() {
      // node1 and 2 should have one each, node 3 is all alone
      assert.equal(Object.keys(node1.group.peers).length, 1);
      assert.equal(Object.keys(node2.group.peers).length, 1);
      assert.equal(Object.keys(node3.group.peers).length, 0);
    });
  }); // End describe discovery
}); // End describe node
