import * as THREE from 'three';
import throttle from 'lodash/throttle';
import * as TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js';
import Animator from './animator';
import FaceSwapResult from './face-swap-result';
import { loadImage } from './utils';
import FaceLandmarks from './face-landmarks';
import SceneImage from './scene-image';
import { getNext as getNextPreprocessedImageData } from './preprocessed-data';



// Set-up the canvas
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementsByTagName('canvas')[0];
let { offsetWidth: width, offsetHeight: height } = canvasContainer;
canvas.width = width;
canvas.height = height;

// Scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(10, width / height, 0.1, 1000);
camera.position.z = 10;

// Disable three.js's console message the hard way
// Kehehe https://github.com/mrdoob/three.js/pull/5835
const _consoleLog = console.log;
console.log = () => {};

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: window.devicePixelRatio == 1,
  alpha: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 0);

// Bring back the console.log
console.log = _consoleLog;

// Stats
const stats = process.env.NODE_ENV == 'development' ? new Stats() : null;
if (stats) {
  stats.showPanel(0);
  stats.dom.style.top = 'auto';
  stats.dom.style.left = 'auto';
  stats.dom.style.right = '0';
  stats.dom.style.bottom = '0';
  document.body.appendChild(stats.dom);
}

// Ray casting stuff
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Set-up scene
const textureSize = Math.min(width, height) * window.devicePixelRatio; // TODO: Can also use Math.max
let sceneImage: SceneImage;

/**
 * Main function
 */
async function main() {
  sceneImage = await prepareNextPreprocessImage();

  const cardScale = fitFaceSwapResultToScreen(sceneImage.faceSwapResult);
  sceneImage.group.scale.setX(cardScale.x);
  sceneImage.group.scale.setY(cardScale.y);
  scene.add(sceneImage.group);
}


async function prepareNextPreprocessImage() {
  const imageData = await getNextPreprocessedImageData(textureSize);

  // Build face landmarks
  const faceLandmarksArr: FaceLandmarks[] = imageData.faceData.faces.map((rawFaceData: any) => {
    return new FaceLandmarks(rawFaceData.points);
  });

  // Load images in parallel
  const [
    baseImage,
    overlayImage
  ] = await Promise.all([
    loadImage(imageData.baseImagePath),
    loadImage(imageData.overlayImagePath)
  ]);

  const swapResult = new FaceSwapResult(
    baseImage,
    overlayImage,
    faceLandmarksArr,
    imageData.faceData.originalWidth,
    imageData.faceData.originalHeight
  );

  const sceneImage = new SceneImage(swapResult);
  await sceneImage.init();

  return sceneImage;
}


/**
 * Animate
 */
let frameCount = 0;
const animator = new Animator((time) => {
  stats && stats.begin();
  frameCount++;

  (TWEEN as any).default.update(time);

  renderer.render(scene, camera);

  stats && stats.end();
});
Animator.setGlobal(animator);


/**
 * Listen mouse move event
 */
const onMouseMove = throttle((e: MouseEvent) => {
  onMouseOrTouchMove(e.clientX, e.clientY);
}, 20);
document.body.addEventListener('mousemove', onMouseMove, false);


/**
 * Core mousemove/touchmove handler
 */
function onMouseOrTouchMove(x: number, y: number) {
  if (!sceneImage) return;

  // Update mouse position and raycaster
  mousePosition.x = (x / width) * 2 - 1;
  mousePosition.y = -(y / height) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);

  // Tilt effect
  const rotationX = ((y / height) - 0.5) * (15 * Math.PI / 180);
  const rotationY = ((x / width) - 0.5) * (30 * Math.PI / 180);
  sceneImage.group.rotation.x = rotationX;
  sceneImage.group.rotation.y = rotationY;

  // Check mouse whether on a face or not
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length > 0) {
    sceneImage.onMouseMove(intersects[0].uv);
  }

  animator.step();
}


/**
 * Listen window resize
 */
const onWindowResize = throttle(() => {
  const { offsetWidth: width_, offsetHeight: height_ } = canvasContainer;
  width = width_;
  height = height_;
  canvas.width = width;
  canvas.height = height;
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  if (sceneImage) {
    const cardScale = fitFaceSwapResultToScreen(sceneImage.faceSwapResult);
    sceneImage.group.scale.setX(cardScale.x);
    sceneImage.group.scale.setY(cardScale.y);
  }

  animator.step();
}, 500);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);


/**
 * Keep the environment clean & beatiful
 */
function dispose() {
  animator.stop();
  window.removeEventListener('resize', onWindowResize, false);
  window.removeEventListener('orientationchange', onWindowResize, false);
  // TODO
}


function fitFaceSwapResultToScreen(swapResult: FaceSwapResult) {
  const viewport = fitPlaneToScreen(camera.position.z - 1, camera.fov, width / height);
  const aspectRatio = swapResult.originalWidth / swapResult.originalHeight;

  const cardScale = Math.min(
    viewport.width,
    viewport.height * aspectRatio
  ); // actually width (because card size is 1x1)
  const cardScaleY = cardScale / aspectRatio; // actually height (because card size is 1x1)
  return {
    x: cardScale,
    y: cardScaleY
  };
}


/**
 * Fit a plane to screen (snapping to sides)
 */
function fitPlaneToScreen(distance: number, cameraFov: number, screenAspectRatio: number) {
  const vFov = cameraFov * Math.PI / 180;
  const planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
  const planeWidthAtDistance = planeHeightAtDistance * screenAspectRatio;
  return {
    width: planeWidthAtDistance,
    height: planeHeightAtDistance
  };
}


/**
 * Go go go
 */
main()
  .then(() => animator.step())
  .catch((err) => console.error(err));
