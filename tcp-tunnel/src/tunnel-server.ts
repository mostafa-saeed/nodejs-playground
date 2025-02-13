import net, { createConnection } from 'node:net';
import http, { IncomingMessage, ServerResponse } from 'node:http';

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

const getTCPRequest = (req: IncomingMessage) => {
  // Construct the HTTP request to forward
  const requestData = `${req.method} ${req.url} HTTP/1.1\r\n`;
  const headers = Object.entries(req.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r\n');

  return `${requestData}${headers}\r\n\r\n`;
};

const getJSONResponse = (data: Object, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const createTunnelHandler = async (
  _req: IncomingMessage,
  res: ServerResponse
) => {
  // Check if we have a tunnel
  let tunnel = sockets.get('localhost');
  if (!tunnel) {
    // Create new tcp server
    tunnel = await createTCPServer();

    // Store in the map
    sockets.set('localhost', tunnel);
  }

  // Return the port
  getJSONResponse(
    {
      port: (tunnel as any).address().port,
    },
    res
  );
};

const statusHandler = async (_req: IncomingMessage, res: ServerResponse) => {
  const tunnel = sockets.get('localhost');

  if (!tunnel) {
    return getJSONResponse(
      {
        localhost: null,
      },
      res
    );
  }

  getJSONResponse(
    {
      localhost: await getTunnelInfo(tunnel),
    },
    res
  );
};

const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const tunnel = sockets.get('localhost');

  if (!tunnel) {
    return getJSONResponse(
      {
        error: 'TUNNEL_NOT_FOUND',
      },
      res
    );
  }

  if (!socket) {
    return getJSONResponse(
      {
        error: 'NO_CONNECTIONS',
      },
      res
    );
  }

  console.log('SOCKET', socket.wrap);

  console.log('RES_SOCKET', res?.socket?.wrap);

  // const requestData = getTCPRequest(req);
  // socket.write(requestData);

  const requestData = {
    path: req.url,
    method: req.method,
    headers: req.headers,
    createConnection() {
      return socket;
    },
  };

  const clientRequest = http.request(
    requestData,
    (clientRes: IncomingMessage) => {
      res.writeHead(clientRes.statusCode, clientRes.headers);
      clientRes.pipe(res);
    }
  );

  req.pipe(clientRequest);
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    console.log('REQ_', req.url, req.method);

    if (
      req.url.startsWith('/status') &&
      req.method.toLocaleLowerCase() === 'get'
    ) {
      return statusHandler(req, res);
    }

    if (
      req.url.startsWith('/tunnels') &&
      req.method.toLocaleLowerCase() === 'post'
    ) {
      return createTunnelHandler(req, res);
    }

    return requestHandler(req, res);
  }
);

server.listen(3000, () => {
  console.log('SERVER_STARTED', {
    port: 3000,
  });
});
