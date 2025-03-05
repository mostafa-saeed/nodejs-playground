import { promises as fs } from 'node:fs';
import { basename } from 'node:path';

const ENDPOINT = 'http://localhost:3000/url';

(async () => {
  const [, , path] = process.argv;
  if (!path) {
    console.log('PATH_IS_REQUIRED');
    process.exit(1);
  }

  const hash = await fs.readFile(path, {
    encoding: 'base64',
  });

  const filename = basename(path);

  console.log(`${ENDPOINT}/${encodeURIComponent(hash)}/${filename}`);
})();
