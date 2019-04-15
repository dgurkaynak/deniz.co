import * as THREE from 'three';
import debounce from 'lodash/debounce';
import shuffle from 'lodash/shuffle';
import SceneCard from './scene-card';
import SceneCardManager from './scene-card-manager';
import { swaps } from './assets/swaps/index';


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
  antialias: true,
  alpha: true
});
renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 0);

// Bring back the console.log
console.log = _consoleLog;

// Set-up scene
const cards: SceneCard[] = shuffle(swaps).map((swap) => {
  return new SceneCard(null, () => swap.load());
});
const cardManager = new SceneCardManager({
  camera,
  cards,
  scene,
  screenWidth: width,
  screenHeight: height
});
cardManager.init().then(() => console.log('manager loaded'));


/**
 * Animate
 */
let rAFId: number;
let frameCount = 0;
function animate() {
  rAFId = requestAnimationFrame(animate);
  frameCount++;

  // Dummy scroll
  camera.position.y -= 0.001; // TODO: Viewport'a gore scale olmali
  if (frameCount % 30 == 0) {
    cardManager.update();
  }

  renderer.render(scene, camera);
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
 * Go go go
 */
animate();
