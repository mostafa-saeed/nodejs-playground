const MillisecondsCounter = require('./lib');

const tinyCount = (milliseconds, cb) => {
  const counter = new MillisecondsCounter(milliseconds);
  counter.on('DONE', cb);
  // counter.on('NEW_VALUE', (count) => console.log(`The new value is ${count}`));
};

tinyCount(2000, (count) => console.log(`The result is ${count}`));
