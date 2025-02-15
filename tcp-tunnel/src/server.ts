import net from 'node:net';
import express from 'express';

const app = express();

app.use((req, res, next) => {
  console.log('INCOMING_REQUEST', req.method, req.get('host'), req.url);

  next();
});

app.get('/status', (_req, res) => {
  res.json({
    running: true,
  });
});

app.get('/test', (_req, res) => {
  res.json({
    port: 8000,
    test: true,
  });
});

const server = app.listen(8000, () => {
  console.log('SERVER_STARTED', 8000);
});

type MySocket = net.Socket & {
  id: number;
};

server.on('connection', (socket: MySocket) => {
  socket.id = Math.floor(Math.random() * 1000);
  console.log('A new connection was made by a client.', socket.id);
  socket.setTimeout(0);
  socket.setKeepAlive(true);

  socket.on('close', () => console.log('SOCKET_CLOSED', socket.id));
});

server.keepAliveTimeout = 60 * 1000 + 1000;
server.headersTimeout = 60 * 1000 + 2000;
