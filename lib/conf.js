'use strict';

/* Module imports */
const program = require('commander');
const pkgjson = require('../package.json');
  
/* Module init */
program
  .version(pkgjson.version)
  .option('--config [file]', 'Configuration file')
  .option('--groupName [name]', 'Group name', 'default')
  .option('--discovery-scheme [scheme]', 'Discovery scheme', 'redis')
  .option('--discovery-interval [ms]', 'Delay in ms between discovery searches', 5000)
  .option('--communication-scheme [scheme]', 'Communication scheme', 'tcp')
  .option('--discovery-udp-port [port]', 'Discovery/UDP port', 9999)
  .option('--discovery-redis-host [host]', 'Discovery/Redis host', '10.0.0.2')
  .option('--discovery-redis-port [port]', 'Discovery/Redis port', 6379)
  .option('--discovery-redis-channel [channel]', 'Discovery/Redis channel', 'mesh')
  .option('--communication-tcp-port [port]', 'Communication/TCP port', 12431)
  .option('--serialization [scheme]', 'Serialization scheme', 'json')
  .option('--logLevel [level]', 'Log level', 'info')
  .parse(process.argv);

/* Module exports */

const configuration = {
  groupName: program.groupName,
  serialization: program.serialization,
  logLevel: program.logLevel,
  discovery: {
    interval: program.discoveryInterval,
    scheme: program.discoveryScheme,
    udp: {
      port: program.discoveryUdpPort
    },
    redis: {
      host: program.discoveryRedisHost,
      port: program.discoveryRedisPort,
      channel: program.discoveryRedisChannel,
    }
  },
  communication: {
    scheme: program.communicationScheme,
    tcp: {
      port: program.communicationTcpPort      
    }
  }
};

module.exports = configuration;
