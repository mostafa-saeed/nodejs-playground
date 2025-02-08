import net from 'node:net';

const HOSTNAME = 'localhost';

const requestTunnel = async () => {
  const result = await fetch('http://localhost:3000/tunnels', {
    method: 'POST',
  });

  return result.json();
};

const connectToTCPServer = (port: number): Promise<net.Socket> =>
  new Promise((resolve) => {
    const connection = net.createConnection({
      host: HOSTNAME,
      port,
    });

    connection.once('connect', () => resolve(connection));
  });

(async () => {
  // Ask for a new tunnel
  const { port } = await requestTunnel();

  // Connect to the tunnel using TCP
  const remote = await connectToTCPServer(port);
  console.log('CONNECTED_TO_TCP_SERVER');
  remote.pause();
  remote.setKeepAlive(true);

  remote.on('close', () => {
    console.log('Connection closed');
  });

  remote.on('error', (error) => {
    console.log('REMOTE_ERROR', error);
  });

  remote.on('data', (data) => {
    console.log('DATA', data.toString());
  });

  // Open a TCP connection with with local server (8000)
  const local = await connectToTCPServer(8000);
  console.log('CONNECTED_TO_LOCAL_SERVER');
  local.on('error', (error) => {
    console.log('LOCALE_ERROR', error);
  });
  remote.resume();

  // Pipe the requests to the local server
  remote.pipe(local).pipe(remote);
})();
