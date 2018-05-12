'use strict';

// Local communication only, meant for unit testing

/* Module imports */
const EventEmitter  = require('events');
const emitter       = new EventEmitter();
const mesh          = require('../mesh');

/* Module contents */
class LocalCommunication extends mesh.communication.Communication {
  constructor(node) {
    super(node);

    this.node = node;

    this.recv = [];
    this.sent = [];

    emitter.on(`message:${this.node.nodeId}`, (message) => {
      this.recv.push(message);
      const unserializedMessage = mesh.serialize.open(message.toString());
      this.node.onPeerMessage(unserializedMessage);
    });

    mesh.logger.info(`Local communication active for ${this.node.nodeId}`);
  }

  send(nodeInfo, message) {
    mesh.logger.debug('Sending ', message, ' to ', nodeInfo);

    const serializedMessage = mesh.serialize.pack(message);
    emitter.emit(`message:${nodeInfo.nodeId}`, serializedMessage);
  }

  getAddress() {
    return `message:${this.node.nodeId}`;
  }
}

/* Module exports */
module.exports = LocalCommunication;
