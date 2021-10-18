const { spawn} = require('child_process');

module.exports = {
  sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  },


  spawnFfmpeg() {
    const args = [
      // '-f', 'm4a',
      // '-i', 'pipe:0',
      
      '-i', './src/video1.m4a',
  
      '-acodec',
      'libmp3lame',
  
      '-f', 'mp3',
      'pipe:1',
      
      // '-y',
      // 'video.mp3',
    ];
  
    const ffmpeg = spawn('ffmpeg', args);
  
    console.log('Spawning ffmpeg ' + args.join(' '));
  
    ffmpeg.on('exit', function (code) {
      console.log('FFMPEG child process exited with code ' + code);
    });
  
    ffmpeg.stderr.on('data', function (data) {
      console.error('Incoming data: ' + data);
    });
  
    return ffmpeg;
  },
};
