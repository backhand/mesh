'use strict';

// Local communication only, meant for unit testing
'use strict';

const EventEmitter = require('events');
const emitter = new EventEmitter();

const mesh = require('../mesh');

class LocalDiscovery extends mesh.discovery.Discovery {
  constructor(node) {
    super(node);

    this.node = node;

    this.recv = [];
    this.sent = [];

    emitter.on('ping', this.onReply.bind(this));

    mesh.logger.info(`Local Discovery active for node ${this.node.nodeId}`);
  }

  search() {
    try {
      const serializedMessage = mesh.serialize.pack(this.node.getSearchMessage());
      mesh.logger.debug(`Local Discovery - Sent ping: ${serializedMessage}`);
      this.sent.push(serializedMessage);
      emitter.emit('ping', serializedMessage);
    } catch (err) {
      mesh.logger.error(err);
    }
  }

  onReply(message) {
    this.recv.push(message);
    try {
      const unserializedMessage = mesh.serialize.open(message.toString());
      this.node.onDiscovery(unserializedMessage);
    } catch (err) {
      mesh.logger.error(err);
    }
  }
}

module.exports = LocalDiscovery;
