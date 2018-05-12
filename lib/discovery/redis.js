'use strict';

/* Module imports */
const mesh  = require('../mesh');
const redis = mesh.promise.promisifyAll(require('redis'));

/* Module contents */
class RedisDiscovery extends mesh.discovery.Discovery {
  constructor(node) {
    super(node);

    this.node = node;

    this.redisPort    = node.configuration.discovery.redis.port;
    this.redisHost    = node.configuration.discovery.redis.host;
    this.redisChannel = node.configuration.discovery.redis.channel;

    mesh.logger.info(`Redis Discovery - connecting to: ${this.redisHost}:${this.redisPort}`);

    this.connect('pub');
    this.connect('sub');
  }

  connect(type) {
    const retry = () => {
      setTimeout(() => {
        this.connect(type);
      }, 5000);
    };

    try {
      const client = redis.createClient({
        host: this.redisHost,
        port: this.redisPort
      });
      client.on('error', (err) => {
        mesh.logger.error(`Redis Discovery - ${type} client connection error`, err);
        retry();
      });
      client.on('connect', () => {
        if (type === 'sub') {
          client.subscribe(this.redisChannel);
          client.on('message', (channel, message) => {
            mesh.logger.debug(`Redis Discovery - Received: ${message} (${channel})`);
            this.onReply(message);
          });
        }
        this[`${type}Client`] = client;
      });
    } catch (err) {
      mesh.logger.error(`Redis Discovery - ${type} client connection error`, err);
      retry();
    }
  }

  async search() {
    if (!this.pubClient) {
      return;
    }

    try {
      const serializedMessage = mesh.serialize.pack(this.node.getSearchMessage());
      mesh.logger.debug(`Redis Discovery - Sent ping: ${serializedMessage}`);
      return this.pubClient.publishAsync(this.redisChannel, serializedMessage);
    } catch (err) {
      mesh.logger.error(err);
    }
  }

  onReply(message) {
    try {
      const unserializedMessage = mesh.serialize.open(message.toString());
      this.node.onDiscovery(unserializedMessage);
    } catch (err) {
      mesh.logger.error(err);
    }
  }
}

/* Module exports */
module.exports = RedisDiscovery;
