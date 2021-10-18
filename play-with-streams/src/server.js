const { Readable } = require('stream');
const fs = require('fs');
const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const Stream = require('./stream');
const { spawnFfmpeg } = require('./util');

const server = express();

server.use(express.json());
server.use(multer().any());
server.use(express.static('src/static'));

server.get('/stream', async (req, res) => {
  const stream = new Stream(10);
  stream
    .on('data', (data) => res.write(data.toString()))
    .on('end', () => res.end())
  ;
});

server.get('/convert', async (req, res) => {
  const file = './src/video1.m4a';
  const readable = fs.createReadStream(file);

  ffmpeg({ source: readable }).fromFormat('m4a').outputFormat('mp3').pipe(res);
});

server.post('/convert', async (req, res) => {
  const [video] = req.files;
  const readable = Readable.from(video.buffer);
  
  readable.pipe(res);
});

server.post('/convertmp3', async (req, res) => {
  // const [video] = req.files;
  // const readable = Readable.from(video.buffer);

  const ffmpeg = spawnFfmpeg();
  ffmpeg.stdout.pipe(res);
});

module.exports = server;
