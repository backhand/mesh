'use strict';

/* Module imports */
const net  = require('net');
const mesh = require('../mesh');

/* Module constants */
const maxListenAttempts = 10;

/* Module constents */
class TCPCommunication extends mesh.communication.Communication {
  constructor(node) {
    super(node);

    this.binding = node.binding;
    this.port    = node.configuration.communication.tcp.port;
    this.addr    = this.binding.address;

    this.server = net.createServer(this.onMessageReceived.bind(this));
    this.listen();
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

  onMessageReceived(connection) {
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
  }

  listen() {
    let listenAttempts = 0;
    const attemptListen = () => {
      listenAttempts++;
      this.server.listen(this.port, () => {
        mesh.logger.info(`TCP Communication - listening on ${this.port}`);
      });
    };

    this.server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && listenAttempts < maxListenAttempts) {
        mesh.logger.info(`TCP Communication - Port ${this.port} in use, trying next`);
        // Todo - handle port > 65535
        this.port = this.port + 1;
        return attemptListen();
      }

      mesh.logger.info(`TCP Communication - Unable to listen on port ${this.port}`, err);
    });
    attemptListen();
  }

  getAddress() {
    return {
      ip:   this.addr,
      port: this.port
    };
  }
}

/* Module exports */
module.exports = TCPCommunication;
