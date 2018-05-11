'use strict';

const net  = require('net');
const mesh = require('../mesh');

class TCPCommunication extends mesh.communication.Communication {
  constructor(node) {
    super(node);

    this.binding = node.binding;
    this.port    = node.configuration.communication.tcp.port;
    this.addr    = this.binding.address;

    const server = net.createServer((connection) => {
      connection.setEncoding('utf8');
      const address = connection.address();
      mesh.logger.debug(`TCP Communication - connection from ${address.address}:${address.port}`);

      let message = '';
      connection.on('data', (chunk) => {
        message += chunk;
      });

      connection.on('end', () => {
        mesh.logger.debug(`TCP Communication - connection from ${address.address}:${address.port} disconnected`);
        try {
          const unserializedMessage = mesh.serialize.open(message);
          this.node.onPeerMessage(unserializedMessage);
        } catch (err) {
          mesh.logger.error(`TCP Communication - error`, err);
        }
      });
    });
    server.on('error', (err) => {
      mesh.logger.error(`TCP Communication - error`, err);
    });
    server.listen(this.port, () => {
      mesh.logger.info(`TCP Communication - listening on ${this.port}`);
    });
    this.server = server;
  }

  send(nodeInfo, message) {
    if (!nodeInfo.address) {
      mesh.logger.error(`TCP communication - no address for node`, nodeInfo);
      return;
    }

    mesh.logger.debug('Sending ', message, ' to ', nodeInfo);

    const client = net.createConnection(nodeInfo.address.port, nodeInfo.address.address, () => {
      const serializedMessage = mesh.serialize.pack(message);
      client.write(serializedMessage);
      client.end();
    });
  }

  getAddress() {
    return {
      ip:   this.addr,
      port: this.port
    };
  }
}

module.exports = TCPCommunication;
