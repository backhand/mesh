'use strict';

/* Module imports */
const os     = require('os');
const crypto = require('crypto');
const ip     = require('ip');
const each   = require('@backhand/each');
const _      = require('lodash');

/* Module exports */
exports.findFirstNonInternalBinding = findFirstNonInternalBinding;
exports.hash           = {};
exports.hash.md5       = hashFunction('md5'),
exports.hash.sha1      = hashFunction('sha1'),
exports.hash.sha256    = hashFunction('sha256'),
exports.hash.sha512    = hashFunction('sha512')
exports.random         = random;
exports.defineProperty = defineProperty;
exports.sleep          = sleep;
exports.deepCopy       = deepCopy;
exports.cloneDeep      = _.cloneDeep;
exports.defaultsDeep   = _.defaultsDeep;

/*
 * Iterates over network interfaces and try to find a suitable candidate
 * that's IPv4 and not loopback 
 */
function findFirstNonInternalBinding() {
  const networkInterfaces = os.networkInterfaces();
  for (const [networkInterface, bindings] of each(networkInterfaces)) {
    if (networkInterface === 'lo') {
      continue;
    }
    for (const binding of bindings) {
      if (!binding.internal && binding.family === 'IPv4') {
        const subnet = ip.subnet(binding.address, binding.netmask);
        Object.assign(binding, { subnet, networkInterface });
        return binding;
      }
    }
  }
}

function hashFunction(algorithm) {
  return function(input) {
    let hash = crypto.createHash(algorithm);
    hash.update(input, 'utf8');
    return hash.digest('hex');
  };
}

const UINT32_MAX = 4294967295;
function random() {
  const rndVal = crypto.randomBytes(4).readUInt32LE(0);
  return rndVal / UINT32_MAX;
}
random.float = function(lo, hi) {
  return random() * (hi - lo) + lo;
};
random.int = function(lo, hi) {
  return Math.round(exports.random() * (hi - lo) + lo);
};

function defineProperty(obj, key, valueOrGetter, options = {}, isGetter = false) {
  const definition = Object.assign({
    enumerable: false,
    configurable: false
  }, options);

  if (isGetter) {
    definition.get = valueOrGetter;
  } else {
    definition.value = valueOrGetter;
    definition.writable = false;
  }

  Object.defineProperty(obj, key, definition);
}

async function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function deepCopy(src) {
  if (typeof src === 'string') {
    return '' + src;
  }

  if (src instanceof Date) {
    return new Date(src);
  }

  if (Array.isArray(src)) {
    const dst = [];

    for (const [val, index] of each(src)) {
      dst[index] = deepCopy(val);
    }

    return dst;
  }

  if (typeof src === 'object') {
    const dst = {};

    for (const [key, val] of each(src)) {
      dst[key] = deepCopy(val);
    }

    return dst;
  }

  return src;
}
