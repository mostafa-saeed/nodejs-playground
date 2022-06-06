const EventEmitter = require('events');

const TIME_TO_WAIT = 50;

class MillisecondsCounter extends EventEmitter {
  constructor (millisecondsNumber, cb) {
    super();

    this.millisecondsNumber = millisecondsNumber;
    this.cb = cb;
    this.count = 0;

    this.start();
  }

  start() {
    setTimeout(() => {      
      // Emit done
      if (this.count * TIME_TO_WAIT >= this.millisecondsNumber) {
        return this.emit('DONE', this.count);
      }

      // Increase the count
      this.count++;
      
      // Emit newValue
      this.emit('NEW_VALUE', this.count);

      this.start();
    }, TIME_TO_WAIT);
  }

};

module.exports = MillisecondsCounter;
