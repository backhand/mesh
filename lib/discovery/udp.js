'use strict';

/* Module imports */
const dgram   = require('dgram');
const mesh    = require('../mesh');
const logger  = require('../logger');

/* Module contents */
class UdpDiscovery extends mesh.discovery.Discovery {
  constructor(node) {
    super(node);

    this.node = node;

    this.binding = node.binding;
    this.port    = node.configuration.discovery.udp.port;
    this.addr    = this.binding.address;

    logger.info(`UDP Discovery - Binding to:`, this.addr);
    logger.info(`UDP Discovery - Broadcast:`,  this.binding.subnet.broadcastAddress);

    this.server = dgram.createSocket('udp4');

    this.server.on('listening', () => {
      const address = this.server.address();
      this.server.setBroadcast(true);
      logger.info(`UDP Discovery - Server listening on ${address.address}:${address.port}`);
    });

    this.server.on('message', (message, rinfo) => {
      logger.debug(`UDP Discovery - Received: ${message} (${rinfo.address}:${rinfo.port})`);
      this.onMessage(message);
    });

    this.server.bind(this.port, this.addr);

    this.client = dgram.createSocket('udp4');
    this.client.bind({ address: this.addr }, () => {
      this.client.setBroadcast(true);
    });
  }

  async search(message) {
    try {
      const serializedMessage = JSON.stringify(message);
      logger.debug(`UDP Discovery - Sent ping: ${serializedMessage}`);
      this.client.send(Buffer.from(serializedMessage), this.port, this.addr, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    } catch (err) {
      logger.error(err);
    }
  }
}

/* Module exports */
module.exports = UdpDiscovery;
