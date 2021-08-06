import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs-node';
import fetch from 'node-fetch';
import path from 'path';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData,
  fetch,
});

async function initTensorflow() {
  await faceapi.tf.setBackend('tensorflow');
  await faceapi.tf.enableProdMode();
  await faceapi.tf.ENV.set('DEBUG', false);
  await faceapi.tf.ready();
}
initTensorflow();

const __dirname = path.resolve();
const MODELS_URL = path.join(__dirname, 'server/public/models');

async function init() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_URL);
}
init();

export async function decodeImage(file) {
  const decoded = tf.node.decodeImage(file);
  const casted = decoded.toFloat();
  const result = casted.expandDims(0);
  decoded.dispose();
  casted.dispose();
  return result;
}

export async function detectAllFace(decodedImage) {
  const result = await faceapi.detectAllFaces(decodedImage);
  return result;
}
