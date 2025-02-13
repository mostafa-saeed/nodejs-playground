import net from 'node:net';

const HOSTNAME = 'localhost';

const requestTunnel = async () => {
  const result = await fetch('http://localhost:3000/tunnels', {
    method: 'POST',
  });

  return result.json();
};

const connectToTCPServer = (port: number): Promise<net.Socket> =>
  new Promise((resolve, reject) => {
    const connection = net.createConnection({
      host: HOSTNAME,
      port,
    });

    connection.on('connect', () => resolve(connection));
    connection.on('error', (err) => reject(err));
  });

(async () => {
  try {
    // Ask for a new tunnel
    const { port } = await requestTunnel();
    console.log('TUNNEL_PORT:', port);

    // Connect to the tunnel using TCP
    const remote = await connectToTCPServer(port);
    console.log('CONNECTED_TO_TCP_SERVER');

    // Open a TCP connection with the local server (8000)
    const local = await connectToTCPServer(8000);
    console.log('CONNECTED_TO_LOCAL_SERVER');

    // Handle errors on the local socket
    local.on('error', (error) => {
      console.error('LOCAL_ERROR:', error);
    });

    // Handle errors on the remote socket
    remote.on('error', (error) => {
      console.error('REMOTE_ERROR:', error);
    });

    // Handle connection closure
    const handleClose = (reason: string) => {
      console.log('Connection closed', reason);
      remote.destroy();
      local.destroy();
    };

    remote.on('close', () => handleClose('REMOTE'));
    local.on('close', () => handleClose('CLIENT'));

    remote.on('timeout', () => {
      console.log('REMOTE_TIMED_OUT');
    });

    local.on('timeout', () => {
      console.log('LOCAL_TIMED_OUT');
    });

    // Pipe the requests between the remote and local servers
    remote.pipe(local);
    local.pipe(remote);

    // // Enable keep-alive to prevent premature connection closure
    // remote.setKeepAlive(true, 60000); // 60 seconds
    // remote.setTimeout(0); // Disable automatic timeout
    // remote.ref(); // Keep the socket active
    // local.setKeepAlive(true, 60000); // 60 seconds
    local.setTimeout(0); // Disable automatic timeout
    local.ref(); // Keep the socket active

    console.log('Piping data between remote and local servers...');
  } catch (error) {
    console.error('Error:', error);
  }
})();
