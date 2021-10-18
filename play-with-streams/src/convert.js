const { createReadStream, createWriteStream } = require('fs');
const { spawnFfmpeg } = require('./util');

const video = './video.m4a';
const readable = createReadStream(video);
const writeable = createWriteStream('./video.mp3');

const ffmpeg = spawnFfmpeg();
// readable.pipe(ffmpeg.stdin);
ffmpeg.stdout.pipe(writeable);
