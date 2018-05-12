'use strict';

/* Module imports */
const mesh = require('../mesh');

/* Module contents */
class Discovery {
  constructor(node) {
    this.node = node;

    // this.search = options.search;
    if (!this.search) {
      throw new Error('.search() not implemented in subclass');
    }

    this.active = false;
  }

  start() {
    this.active = true;
    this.runSearch();
  }

  async runSearch() {
    // Break loop if requested to stop searching
    if (this.active) {
      await this.search();
      setTimeout(this.runSearch.bind(this), this.node.configuration.discovery.interval);
    }
  }

  stop() {
    this.active = false;
  }
}

/* Module exports */
module.exports = Discovery;
