'use strict';

/* Module imports */
const mesh = require('./mesh');
const each = require('@backhand/each');

/* Module contents */
class MeshGroup {
  constructor(name, node) {
    // Group name
    this.name = name;

    // Primary node
    this.node = node;

    // List of known peer nodes
    const peers = {};
    mesh.util.defineProperty(this, 'peers', () => peers, { enumerable: true }, true);

    // Setup loop to regularly ping nodes and remove if they don't respond
    setInterval(this.pingPeers.bind(this), 10000);
  }

  updatePeerNodes(nodeInfo) {
    if (!this.peers[nodeInfo.nodeId]) {
      mesh.logger.info(`${this.node.nodeId} [${this.name}]: Found new peer ${nodeInfo.nodeId}`);
      this.peers[nodeInfo.nodeId] = nodeInfo;
    }

    mesh.logger.info(`${this.node.nodeId} [${this.name}]: Peer node ${nodeInfo.nodeId} lastSeen updated`);
    this.peers[nodeInfo.nodeId].lastSeen = Date.now();
  }

  handlePing(originNodeInfo, message) {
    this.node.communication.send(originNodeInfo, {
      code: 'pong',
      message: `Hello from ${this.node.nodeId}`
    });
  }

  handlePong(originNodeInfo, message) {
    
  }

  pingPeers() {
    for (const [nodeId, nodeInfo] in each(this.peers)) {
      this.ping(nodeInfo);
    }
  }

  ping(nodeInfo) {
    setTimeout(() => {
      this.node.communication.send(nodeInfo, {
        code: 'ping',
        origin: this.node,
        message: `Hello from ${this.node.nodeId}`
      });
    }, 1500);
  }
}

/* Module exports */
module.exports = MeshGroup;
