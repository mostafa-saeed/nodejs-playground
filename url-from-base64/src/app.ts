import { createBrotliDecompress } from 'node:zlib';
import { Readable } from 'node:stream';
import express, { Request, Response } from 'express';
import { Base64Decode } from 'base64-stream';
import { fileTypeFromBuffer } from 'file-type';
import Mime from 'mime';

const BROWSER_ENCODING_SUPPORT_KEY = 'accept-encoding';

const BROTLI_ENCODING = 'br';

const BASE64_REGEX =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const isValidHash = (hash: string) => BASE64_REGEX.test(hash);

const getDecompressSupport = (headers: Request['headers']) => {
  const browserSupport = headers?.[BROWSER_ENCODING_SUPPORT_KEY];
  if (!browserSupport) {
    return false;
  }

  const supportedAlgorithms = (browserSupport as string).split(', ');

  return supportedAlgorithms.some((algorithm) => algorithm === BROTLI_ENCODING);
};

const server = express();

server.get('/url/:base64', async (req: Request, res: Response) => {
  const { base64 } = req.params;
  const decodedBase64 = decodeURIComponent(base64);
  const isValid = isValidHash(decodedBase64);

  if (!isValid) {
    res.json({
      success: false,
      error: 'WRONG_BASE_64',
    });

    return;
  }

  const buffer = Buffer.from(decodedBase64, 'base64');

  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType) {
    res.json({
      success: false,
      error: 'FORMAT_NOT_SUPPORTED',
    });
  }

  res.setHeader('Content-Type', fileType.mime);
  res.setHeader(
    'Content-Disposition',
    `attachment;filename="file.${fileType.ext}"`
  );
  res.send(buffer);
});

server.get('/url/:base64/:filename', (req: Request, res: Response) => {
  const { base64, filename } = req.params;
  const decodedBase64 = decodeURIComponent(base64);
  const isValid = isValidHash(decodedBase64);

  if (!isValid) {
    res.json({
      success: false,
      error: 'WRONG_BASE_64',
    });

    return;
  }

  const hasDecompressSupport = getDecompressSupport(req.headers);
  const mime = Mime.getType(filename);

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment;filename="${filename}"`);

  // Return compressed content when the browser supports it
  if (hasDecompressSupport) {
    res.setHeader('Content-Encoding', 'br');
  }

  const stream = Readable.from(decodedBase64).pipe(new Base64Decode());

  // Skip server-side decompress when the client sends: accept-encoding: gzip, deflate, br, zstd
  if (!hasDecompressSupport) {
    stream.pipe(createBrotliDecompress()).pipe(res);

    return;
  }

  stream.pipe(res);
});

server.listen(3000, () => {
  console.log('SERVER_STARTED');
});
