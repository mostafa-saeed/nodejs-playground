import net from 'node:net';
import express, { Request, Response } from 'express';

const server = express();

const sockets: Map<string, net.Server> = new Map();

let socket: net.Socket;

const createTCPServer = (): Promise<net.Server> => {
  const tunnel = net.createServer();

  tunnel.on('connection', (soc) => {
    socket = soc;
    socket.on('error', (error) => {
      console.log('SOCKET_ERROR', error);
    });

    console.log('SOCKET_CONNECTED', soc.address());
  });

  return new Promise((resolve) => {
    tunnel.listen(() => resolve(tunnel));
  });
};

const getTunnelInfo = (tunnel: net.Server) =>
  new Promise((resolve, reject) => {
    tunnel.getConnections((error, count) => {
      if (error) {
        return reject(error);
      }

      resolve({
        count,
        port: (tunnel as any).address().port,
      });
    });
  });

server.post('/tunnels', async (req: Request, res: Response) => {
  // Check if we have a tunnel
  let tunnel = sockets.get('localhost');
  if (!tunnel) {
    // Create new tcp server
    tunnel = await createTCPServer();

    // Store in the map
    sockets.set('localhost', tunnel);
  }

  // Return the port
  res.json({
    port: (tunnel as any).address().port,
  });
});

server.get('/status', async (_req: Request, res: Response) => {
  const tunnel = sockets.get('localhost');

  if (!tunnel) {
    return res.json({
      localhost: null,
    });
  }

  res.json({
    localhost: await getTunnelInfo(tunnel),
  });
});

server.post('/request', (req: Request, res: Response) => {
  const tunnel = sockets.get('localhost');

  if (!tunnel) {
    return res.json({
      error: 'TUNNEL_NOT_FOUND',
    });
  }

  if (!socket) {
    return res.json({
      error: 'NO_CONNECTIONS',
    });
  }

  const requestData = JSON.stringify({
    method: req.method,
    url: req.url,
    headers: req.headers,
    // body: req.body,
  });

  socket.write(requestData);

  res.json({
    done: true,
  });
});

// server.on('upgrade', (req, socket, head) => {

// });

server.listen(3000, () => {
  console.log('SERVER_STARTED');
});
