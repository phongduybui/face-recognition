import canvas from 'canvas';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';
import fetch from 'node-fetch';
import path from 'path';
import colors from 'colors';
import db from './db.js';

const { Canvas, Image, ImageData, loadImage } = canvas;
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData,
  fetch,
});

Promise.all([
  await faceapi.tf.setBackend('tensorflow'),
  await faceapi.tf.enableProdMode(),
  await faceapi.tf.ENV.set('DEBUG', false),
  await faceapi.tf.ready(),
]).then(() => console.log('Set backend successfull!'.red.bgBlue));

const __dirname = path.resolve();
const MODELS_URL = path.join(__dirname, 'server/public/models');

Promise.all([
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL),
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_URL),
  // await faceapi.nets.tinyFaceDetector.loadFromDisk(MODELS_URL),
  // await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODELS_URL),
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL),
]).then(() => console.log('Models loaded!'.red.bgYellow));

export async function decodeImage(file) {
  // const decoded = tf.node.decodeImage(file);
  // const casted = decoded.toFloat();
  // const result = casted.expandDims(0);
  // decoded.dispose();
  // casted.dispose();
  // return result;
  const img = await loadImage(file);
  return img;
}

export async function detectAllFace(decodedImage) {
  const result = await faceapi
    .detectAllFaces(decodedImage)
    .withFaceLandmarks()
    .withFaceDescriptors();
  return result;
}

function loadDescriptors() {
  const labeledDescriptors = db.map(async (user) => {
    const imgUrl = `http://localhost:5000/${user.img}`;
    const imgSource = await loadImage(imgUrl);
    const { descriptor } = await faceapi
      .detectSingleFace(imgSource)
      .withFaceLandmarks()
      .withFaceDescriptor();

    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(user.label, [
      descriptor,
    ]);
    return labeledDescriptor;
  });

  return Promise.all(labeledDescriptors);
}

export async function detectSingleFace(decodedImage) {
  const labeledDescriptors = await loadDescriptors();
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

  const result = await faceapi
    .detectSingleFace(decodedImage, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  console.log({ result, faceMatcher });

  const out = faceapi.createCanvasFromMedia(decodedImage);

  // faceapi.draw.drawDetections(out, result);

  // console.log(out.toDataURL());

  const bestMatch = faceMatcher.findBestMatch(result.descriptor);
  if (bestMatch.distance < 0.5) {
    console.log('Diem danh thanh cong');
  }

  const box = result.detection.box;
  const drawBox = new faceapi.draw.DrawBox(box, {
    label: `${bestMatch.label} (${Number(1 - bestMatch.distance).toFixed(2)})`,
  });
  drawBox.draw(out);

  return out.toDataURL();
}

export async function recogniteSingleFace(decodedImage, userId) {
  try {
    const user = db.find((u) => u.id === userId);
    const imgUrl = `http://localhost:5000/${user.img}`;
    const imgSource = await loadImage(imgUrl);
    // const useTinyModel = true;
    const { descriptor } = await faceapi
      .detectSingleFace(imgSource)
      .withFaceLandmarks()
      .withFaceDescriptor();

    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(user.label, [
      descriptor,
    ]);
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptor);

    const result = await faceapi
      .detectSingleFace(decodedImage)
      .withFaceLandmarks()
      .withFaceDescriptor();

    const dims = new faceapi.Dimensions(250, 350);

    const out = faceapi.createCanvasFromMedia(decodedImage, dims);

    // faceapi.draw.drawDetections(out, result);

    // console.log(out.toDataURL());

    const bestMatch = faceMatcher.findBestMatch(result.descriptor);

    console.log({ result, faceMatcher, bestMatch });

    const box = result.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, {
      label: `${
        bestMatch.distance > 0.45 ? 'Unknows' : bestMatch.label
      } (${Number(1 - bestMatch.distance).toFixed(2)})`,
    });
    drawBox.draw(out);
    return { dataUrl: out.toDataURL(), isSuccess: bestMatch.distance <= 0.45 };
  } catch (error) {
    console.log(error);
    return { error };
  }
}
