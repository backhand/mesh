'use strict';

const mesh     = require('../lib/mesh');
const MockNode = require('./mock/node');
const assert   = require('assert');

describe('group', function() {
  describe('constructor', function() {
    it('should create a group', function() {
      const node = MockNode();
      const group = new mesh.Group(mesh.conf.groupName, node);

      assert.equal(group.name, mesh.conf.groupName);
      assert.equal(group.node.nodeId, node.nodeId);
      assert.deepEqual(group.peers, {});
    });
  }); // End describe constructor

  describe('updatePeerNodes', function() {
    it('should update list of peers', async function() {
      const node = MockNode();
      const group = new mesh.Group(mesh.conf.groupName, node);

      const then = Date.now();

      const newNode = {
        nodeId: 'someNewNode',
        address: {
          address: '1.2.3.4',
          port: 12345
        }
      };
      group.updatePeerNodes(newNode);

      assert.equal(Object.keys(group.peers).length, 1);
      assert.ok(group.peers[newNode.nodeId]);
      assert.ok(group.peers[newNode.nodeId].lastSeen >= then);

      await mesh.util.sleep(50);

      const oldLastSeen = group.peers[newNode.nodeId].lastSeen;
      group.updatePeerNodes(newNode);
      assert.ok(group.peers[newNode.nodeId].lastSeen > oldLastSeen);
    });
  }); // End describe updatePeerNodes


  // it('should update ', async function() {
  //   const node = MockNode();
  //   const group = new mesh.Group(mesh.conf.groupName, node);

  //   assert.equal(group.name, mesh.conf.groupName);
  //   assert.equal(group.node.nodeId, node.nodeId);
  //   assert.deepEqual(group.peers, {});
  // });

  // handlePing
  // pingPeers
  // ping

    // await mesh.util.sleep(5000);

    // assert.ok(node.communication.send.called);
}); // End describe group
