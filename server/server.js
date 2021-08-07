import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import {
  decodeImage,
  detectAllFace,
  detectSingleFace,
} from './faceapiServices.js';
const app = express();
const port = 5000;

const __dirname = path.resolve();
app.use('/public', express.static(path.join(__dirname, 'server/public')));

app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload', async (req, res) => {
  const { file } = req.files;
  const decodedImage = await decodeImage(file.data);

  const results = await detectSingleFace(decodedImage);

  res.send(results);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
