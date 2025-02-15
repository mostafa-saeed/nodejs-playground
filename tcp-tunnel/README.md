## About

- A very basic ngrok clone, mostly for experimenting and educational purposes.

## Available Commands:

- `npm run start:tunnel-server`: Starts the main server that should be publicly accessible.
- `npm run start:server`: Starts a basic ExpressJS server on port 8000. (Which we want to tunnel)
- `npm run invoke`: Asks the tunnel server to open a tcp server, which is used later to tunnel the incoming requests. Then it connects to the local server. Finally it pipes the incoming requests from the `remote` to `local` tcp connections.
- `npm run start:tunnel`: A very basic TCP server that pipes the incoming from port 3000 to 8000.

### All the commands have a development command that will restart whenever the code changes. Just replace `start` with `dev`.

## Next Steps

- Socket events handling

- Better code with DS

- Socket timeout to close the server

- Docker

- Domain binding
  - tunnel.local
  - \*.tunnel.local

## Inspired By:

- https://github.com/localtunnel/localtunnel
