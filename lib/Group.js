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

    // Timeout for dropping nodes - a multiple of discovery interval
    this.nodeTimeout = 4 * this.node.configuration.discovery.interval;

    // Setup loop to regularly ping nodes and remove if they don't respond
    setInterval(this.doPeerStatus.bind(this), 2 * this.node.configuration.discovery.interval);
  }

  addPeerNode(nodeInfo) {
    if (!this.peers[nodeInfo.nodeId]) {
      mesh.logger.info(`${this.node.nodeId} [${this.name}]: Found new peer ${nodeInfo.nodeId}`);
      this.peers[nodeInfo.nodeId] = nodeInfo;
    }

    mesh.logger.debug(`${this.node.nodeId} [${this.name}]: Peer node ${nodeInfo.nodeId} lastSeen updated`);
    this.peers[nodeInfo.nodeId].lastSeen = Date.now();
  }

  dropPeerNode(nodeId) {
    delete this.peers[nodeId];
  }

  handlePing(originNodeInfo, message) {
    this.node.communication.send(originNodeInfo, {
      code: 'pong',
      message: `Hello from ${this.node.nodeId}`
    });
  }

  handlePong(originNodeInfo, message) {

  }

  doPeerStatus() {
    for (const [nodeId, nodeInfo] of each(this.peers)) {
      if (nodeInfo.lastSeen < Date.now() - this.nodeTimeout) {
        mesh.logger.info(`Dropped peer node ${nodeId} due to timeout`);
        this.dropPeerNode(nodeId);
      }
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
