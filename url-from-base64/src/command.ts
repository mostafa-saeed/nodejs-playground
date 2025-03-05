import { promises as fs, createReadStream } from 'node:fs';
import { basename } from 'node:path';
import { createBrotliCompress, constants } from 'node:zlib';
import { buffer } from 'node:stream/consumers';
import { Base64Encode } from 'base64-stream';

const ENDPOINT = 'http://localhost:3000/url';

(async () => {
  const [, , path] = process.argv;
  if (!path) {
    console.log('PATH_IS_REQUIRED');
    process.exit(1);
  }

  const stream = createReadStream(path)
    .pipe(
      createBrotliCompress({
        params: {
          [constants.BROTLI_PARAM_QUALITY]: 6,
        },
      })
    )
    .pipe(new Base64Encode());

  const base64 = (await buffer(stream)).toString();

  const filename = basename(path);

  console.log(`${ENDPOINT}/${encodeURIComponent(base64)}/${filename}`);
})();
