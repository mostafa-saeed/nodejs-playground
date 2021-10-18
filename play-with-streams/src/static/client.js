const input = document.getElementById('input');
const video = document.getElementById('video');

const fileReader = new FileReader();
var mediaSource = new MediaSource();

video.src = window.URL.createObjectURL(mediaSource);
const mimeType = 'audio/mpeg';

const readFile = (file) => new Promise((resolve) => {
  fileReader.onload = (e) => {
    const { result } = e.target;
    resolve(result);
  };
  fileReader.readAsDataURL(file);
});

const uploadFile = (formData) => fetch('http://localhost:3000/convertmp3', {
  method: 'POST',
  body: formData,
});

const downloadFile = (blob) => {
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'filename.m4a';
  a.click();
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};



input.onchange = async (e) => {
  const [file] = e.target.files;
  if (!file) return;
  console.log(file);

  var formData = new FormData()
  formData.append('video', file);
  const response = await uploadFile(formData);

  const reader = response.body.getReader();
  const sourceBuffer = mediaSource.addSourceBuffer(mimeType);

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // console.log('Received', value);
    sourceBuffer.appendBuffer(value);
    await sleep(10);
  }
  
  console.log('Response fully received');
  
};
