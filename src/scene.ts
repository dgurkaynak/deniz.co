import * as THREE from 'three';
import debounce from 'lodash/debounce';
import * as TWEEN from '@tweenjs/tween.js';

import apollo11BaseImagePath from './assets/preprocessed/apollo11/1024x1024/base.png';
import apollo11OverlayImagePath from './assets/preprocessed/apollo11/1024x1024/overlay.png';
import apollo11Data from './assets/preprocessed/apollo11/1024x1024/data.json';
import FaceSwapResult from './face-swap-result';
import { loadImage } from './utils';
import FaceLandmarks from './face-landmarks';
import SceneImage from './scene-image';



// Set-up the canvas
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementsByTagName('canvas')[0];
const { offsetWidth: width, offsetHeight: height } = canvasContainer;
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

// Ray casting stuff
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Set-up scene
let sceneImage: SceneImage;

/**
 * Main function
 */
async function main() {
  const faceLandmarksArr: FaceLandmarks[] = apollo11Data.faces.map((rawFaceData: any) => {
    return new FaceLandmarks(rawFaceData.points);
  });
  const swapResult = new FaceSwapResult(
    await loadImage(apollo11BaseImagePath),
    await loadImage(apollo11OverlayImagePath),
    faceLandmarksArr,
    apollo11Data.originalWidth,
    apollo11Data.originalHeight
  );

  const viewport = fitPlaneToScreen(camera.position.z - 2, camera.fov, width / height);
  const aspectRatio = swapResult.originalWidth / swapResult.originalHeight;

  const cardScale = Math.min(
    viewport.width,
    viewport.height * aspectRatio
  ); // actually width (because card size is 1x1)
  const cardScaleY = cardScale / aspectRatio; // actually height (because card size is 1x1)

  sceneImage = new SceneImage(swapResult);
  await sceneImage.init();
  sceneImage.forEachMesh((mesh) => {
    scene.add(mesh);

    mesh.scale.setX(cardScale);
    mesh.scale.setY(cardScaleY);
  });
}


/**
 * Animate
 */
let rAFId: number;
let frameCount = 0;
function animate(time: number) {
  rAFId = requestAnimationFrame(animate);
  frameCount++;

  (TWEEN as any).default.update(time);

  renderer.render(scene, camera);
}


/**
 * Listen mouse move event
 */
const onMouseMove = debounce((e: MouseEvent) => {
  onMouseOrTouchMove(e.clientX, e.clientY);
}, 5);
document.body.addEventListener('mousemove', onMouseMove, false);


/**
 * Listen touch move event
 */
const onTouchMove = debounce((e: TouchEvent) => {
  const touch = e.changedTouches.length > 0 ? e.changedTouches[0] : e.touches[0];
  if (!touch) return;
  onMouseOrTouchMove(touch.clientX, touch.clientY);
}, 5);
document.body.addEventListener('touchmove', onTouchMove, false);


/**
 * Core mousemove/touchmove handler
 */
function onMouseOrTouchMove(x: number, y: number) {
  const { innerWidth: width, innerHeight: height } = window;
  const rotationX = ((y / height) - 0.5) * (15 * Math.PI / 180);
  const rotationY = ((x / width) - 0.5) * (30 * Math.PI / 180);
  sceneImage && sceneImage.forEachMesh((m) => {
    m.rotation.x = rotationX;
    m.rotation.y = rotationY;
  });


  // Update mouse position and raycaster
  mousePosition.x = (x / window.innerWidth) * 2 - 1;
  mousePosition.y = -(y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);

  // Check mouse whether on a face or not
  // TODO: Do this maybe more throttled way?
  if (!sceneImage) return;
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length > 0) {
    sceneImage.onMouseMove(intersects[0].uv);
  }
}


/**
 * Listen window resize
 */
const onWindowResize = debounce(() => {
  const { offsetWidth: width, offsetHeight: height } = canvasContainer;
  canvas.width = width;
  canvas.height = height;
  renderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  console.log('resize');
  // TODO: Resize cards
}, 500);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);


/**
 * Keep the environment clean & beatiful
 */
function dispose() {
  cancelAnimationFrame(rAFId);
  window.removeEventListener('resize', onWindowResize, false);
  window.removeEventListener('orientationchange', onWindowResize, false);
  // TODO
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
  .then(() => {
    rAFId = requestAnimationFrame(animate);
  })
  .catch((err) => console.error(err));
