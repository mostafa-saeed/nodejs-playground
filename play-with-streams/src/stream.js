const { Readable } = require('stream');
const { sleep } = require('./util');

class MyStream extends Readable {
  constructor(limit) {
    super();
    this.current = 0;
    this.limit = limit;
  }

  async _read() {
    await sleep(1000);
    this.current += 1;
    this.push(this.current.toString());

    if (this.current >= this.limit) this.push(null);
  }
};

module.exports = MyStream;
