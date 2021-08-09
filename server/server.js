import express from 'express';
// import fileUpload from 'express-fileupload';
import path from 'path';
import bodyParser from 'body-parser';
import {
  decodeImage,
  detectAllFace,
  detectSingleFace,
} from './faceapiServices.js';
import db from './db.js';
const app = express();
const port = 5000;

const __dirname = path.resolve();
app.use('/public', express.static(path.join(__dirname, 'server/public')));

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
// app.use(fileUpload());

app.get('/', (req, res) => {
  res.json({ hello: 'Hello' });
});

app.post('/upload', async (req, res) => {
  // const { file } = req.files;
  const buffer = Buffer.from(req.body.file, 'base64');
  console.log(buffer);
  const decodedImage = await decodeImage(buffer);

  const results = await detectSingleFace(decodedImage);

  res.send(results);
  // console.log(req.body.file);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const userExist = db.find(
    (u) => u.username === username && u.password === password
  );
  if (userExist) {
    res.status(200);
    res.json({ user: userExist, message: 'Login successfull!' });
  } else {
    res.json({ error: 'Invalid username or password. Try again!' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
