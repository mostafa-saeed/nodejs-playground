import net from 'node:net';

const HOSTNAME = 'localhost';

const requestTunnel = async () => {
  const result = await fetch('http://localhost:3000/tunnels', {
    method: 'POST',
  });

  return result.json() as Promise<{
    port: number;
  }>;
};

const connectToTCPServer = (port: number): Promise<net.Socket> =>
  new Promise((resolve, reject) => {
    const connection = net.createConnection({
      host: HOSTNAME,
      port,
    });

    connection.setKeepAlive(true);
    connection.setTimeout(0);

    connection.on('connect', () => {
      console.log('CONNECTED', {
        port,
      });

      return resolve(connection);
    });
    connection.on('error', (err) => reject(err));
  });

(async () => {
  // Ask for a new tunnel
  const { port } = await requestTunnel();
  console.log('TUNNEL_PORT:', port);

  // Connect to the tunnel using TCP
  const remote = await connectToTCPServer(port);
  console.log('CONNECTED_TO_TCP_SERVER');

  // Open a TCP connection with the local server (8000)
  let local = await connectToTCPServer(8000);
  console.log('CONNECTED_TO_LOCAL_SERVER');

  // Handle errors on the local socket
  local.on('error', (error) => {
    console.error('LOCAL_ERROR:', error);
  });

  // Handle errors on the remote socket
  remote.on('error', (error) => {
    console.error('REMOTE_ERROR:', error);
  });

  remote.on('timeout', () => {
    console.log('REMOTE_TIMED_OUT');
  });

  local.on('timeout', () => {
    console.log('LOCAL_TIMED_OUT');
  });

  // Pipe the requests between the remote and local servers
  remote.pipe(local);
  local.pipe(remote);

  console.log('TUNNEL_STARTED');
})();
