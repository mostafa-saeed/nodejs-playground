const server = require('./server');
const Stream = require('./stream');

server.listen(3000, () => console.log('SERVER STARTED'));

// const stream = new Stream(10);
// stream
//   .on('data', (data) => console.log(data.toString()))
//   .on('end', () => console.log('STREAM_ENDED'))
// ;