import express, { Request, Response } from 'express';
import Mime from 'mime';
import { fileTypeFromBuffer } from 'file-type';

const BASE64_REGEX =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const isValidHash = (hash: string) => BASE64_REGEX.test(hash);

const server = express();

server.get('/url/:hash', async (req: Request, res: Response) => {
  const { hash } = req.params;
  const decodedHash = decodeURIComponent(hash);
  const isValid = isValidHash(decodedHash);

  if (!isValid) {
    res.json({
      success: false,
      error: 'WRONG_BASE_64',
    });

    return;
  }

  const buffer = Buffer.from(decodedHash, 'base64');

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

server.get('/url/:hash/:filename', (req: Request, res: Response) => {
  const { hash, filename } = req.params;
  const decodedHash = decodeURIComponent(hash);
  const isValid = isValidHash(decodedHash);

  if (!isValid) {
    res.json({
      success: false,
      error: 'WRONG_BASE_64',
    });

    return;
  }

  const buffer = Buffer.from(decodedHash, 'base64');
  const mime = Mime.getType(filename);

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment;filename="${filename}"`);
  res.send(buffer);
});

server.listen(3000, () => {
  console.log('SERVER_STARTED');
});
