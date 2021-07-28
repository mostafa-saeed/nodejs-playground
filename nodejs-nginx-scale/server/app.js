import { promises } from 'fs';
import { createServer } from 'http';
import { hostname } from 'os';
import url from 'url';

const { PORT, DB_FILE } = process.env;

const readFile = async (path) => {
  const buffer = await promises.readFile(path);
  return JSON.parse(buffer.toString());
};

(async () => {
  // Read file
  const db = await readFile(`./${DB_FILE}.json`);

  // Start the server
  const server = createServer((req, res) => {
    const { filter } = url.parse(req.url, true).query;
    const matched = db.filter((customer) => customer.name.toLowerCase().startsWith(filter));
    console.log(`Request was handled by ${hostname}`);
    res.end(JSON.stringify(matched));
  });

  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
})();
