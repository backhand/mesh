'use strict';

const dgram  = require('dgram');
const logger = require('../logger');

// class UdpDiscovery extends DiscoveryInterface {
class UdpDiscovery {
  constructor(node) {
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

    this.server.on('message', (msg, rinfo) => {
      logger.debug(`UDP Discovery - Received: ${msg} (${rinfo.address}:${rinfo.port})`);
      this.pong(msg);
    });

    this.server.bind(this.port, this.addr);

    this.client = dgram.createSocket('udp4');
    this.client.bind({ address: this.addr }, () => {
      this.client.setBroadcast(true);
    });
  }

  ping(message) {
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

  pong(message) {
    try {
      const unserializedMessage = JSON.parse(message.toString());
      this.node.onPing(unserializedMessage);
    } catch (err) {
      logger.error(err);
    }
  }
}

module.exports = UdpDiscovery;
