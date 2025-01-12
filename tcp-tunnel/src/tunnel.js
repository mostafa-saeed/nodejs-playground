import net from 'node:net';

const server = net.createServer((from) => {
  const to = net.createConnection({
    host: 'localhost',
    port: '8000',
  });

  from.pipe(to);
  to.pipe(from);
});

server.listen(3000);
