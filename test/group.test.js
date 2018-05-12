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

  describe('addPeerNode', function() {
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
      group.addPeerNode(newNode);

      assert.equal(Object.keys(group.peers).length, 1);
      assert.ok(group.peers[newNode.nodeId]);
      assert.ok(group.peers[newNode.nodeId].lastSeen >= then);

      await mesh.util.sleep(50);

      const oldLastSeen = group.peers[newNode.nodeId].lastSeen;
      group.addPeerNode(newNode);
      assert.ok(group.peers[newNode.nodeId].lastSeen > oldLastSeen);
    });
  }); // End describe addPeerNode



  describe('doPeerStatus', function() {
    it('should remove a node if not heard from after a while', async function() {
      const node = MockNode();
      const group = new mesh.Group(mesh.conf.groupName, node);

      const newNode = {
        nodeId: 'someNewNode',
        address: {
          address: '1.2.3.4',
          port: 12345
        }
      };
      group.addPeerNode(newNode);
      assert.equal(Object.keys(group.peers).length, 1);
      assert.ok(group.peers[newNode.nodeId]);
      await mesh.util.sleep(3000);
      assert.equal(Object.keys(group.peers).length, 0);
      assert.ok(!group.peers[newNode.nodeId]);
    });
  }); // End describe doPeerStatus
}); // End describe group
