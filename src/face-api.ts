import * as faceapi from 'face-api.js';


import ssdMobileNetV1Manifest from './assets/faceapi-weights/ssd_mobilenetv1_model-weights_manifest.json';
import ssdMobileNetV1ModelPath1 from './assets/faceapi-weights/ssd_mobilenetv1_model-shard1.weights';
import ssdMobileNetV1ModelPath2 from './assets/faceapi-weights/ssd_mobilenetv1_model-shard2.weights';
import faceLandmark68Manifest from './assets/faceapi-weights/face_landmark_68_model-weights_manifest.json';
import faceLandmark68ModelPath from './assets/faceapi-weights/face_landmark_68_model-shard1.weights';


// Hack for loading models with custom weights url path
ssdMobileNetV1Manifest[0].paths = [
  ssdMobileNetV1ModelPath1.replace('/', ''),
  ssdMobileNetV1ModelPath2.replace('/', ''),
];
faceLandmark68Manifest[0].paths = [faceLandmark68ModelPath.replace('/', '')];


export async function init() {
  const [ ssdMobileNetV1WeightMap, faceLandmark68WeightMap ] = await Promise.all([
    faceapi.tf.io.loadWeights(ssdMobileNetV1Manifest, './'),
    faceapi.tf.io.loadWeights(faceLandmark68Manifest, './')
  ]);
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromWeightMap(ssdMobileNetV1WeightMap),
    faceapi.nets.faceLandmark68Net.loadFromWeightMap(faceLandmark68WeightMap)
  ]);
}


export default faceapi;
