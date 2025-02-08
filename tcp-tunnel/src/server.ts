import express from 'express';

const server = express();

server.use((req, res, next) => {
  console.log('INCOMING_REQUEST', req.get('host'), req.url);

  next();
});

server.get('/status', (_req, res) => {
  res.json({
    running: true,
  });
});

server.listen(8000, () => {
  console.log('SERVER_STARTED', 8000);
});
