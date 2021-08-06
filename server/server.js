import express from 'express';
import fileUpload from 'express-fileupload';
import { decodeImage, detectAllFace } from './faceapiServices.js';
const app = express();
const port = 5000;

app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', async (req, res) => {
  const { file } = req.files;
  console.log(file);
  const decodedImage = await decodeImage(file.data);
  console.log(decodedImage);

  const results = await detectAllFace(decodedImage);

  console.log(results);
  res.send('ok');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
