'use strict';

/*
  Class for storing local node information and state
*/

/* Module imports */
const mesh = require('./mesh');
const each = require('@backhand/each');

/* Module contents */
class MeshNode {
  constructor(configuration) {
    // Extend default configuration with overrides
    this.configuration = mesh.util.cloneDeep(mesh.conf);
    const overrides    = mesh.util.cloneDeep(configuration);
    this.configuration = mesh.util.defaultsDeep(overrides, this.configuration);

    // Find a network interface for communication
    const binding = mesh.util.findFirstNonInternalBinding();
    this.binding  = binding;

    // Unique id for this node
    this.nodeId = mesh.util.hash.md5(binding.address + mesh.util.random());

    // Discovery
    this.discoveryScheme  = this.configuration.discovery.scheme;
    this.discovery        = new mesh.discovery[this.discoveryScheme](this);

    // Communication
    this.communicationScheme = this.configuration.communication.scheme;
    this.communication       = new mesh.communication[this.communicationScheme](this);

    // Group this node belongs to
    this.group = new mesh.Group(this.configuration.groupName, this);

    // Start discovering peers
    this.discovery.start();
  }

  info() {
    return {
      nodeId:         this.nodeId,
      group:          this.group.name,
      discovery:      this.discoveryScheme,
      communication:  this.communicationScheme,
      address:        this.communication.getAddress()
    }
  }

  getSearchMessage() {
    return {
      nodeId:  this.nodeId,
      group:   this.group.name,
      address: this.communication.getAddress()
    };
  }

  onDiscovery(msg) {
    if (msg.nodeId === this.nodeId || msg.group !== this.group.name) {
      // Discard the message if from ourself or from another group
      return;
    }

    mesh.logger.debug(`Node - onPeerDiscovery:`, msg);
    this.group.updatePeerNodes(msg);
  }

  onPeerMessage(msg) {
    mesh.logger.info(`Node - onPeerMessage:`, msg);
    switch (msg.code) {
      case 'hello':
        break;

      case 'check':
        this.group.handlePeerCheck(msg);
    }
  }
}

/* Module exports */
module.exports = { init: (configuration) => new MeshNode(configuration) };
