import * as THREE from 'three';
import debounce from 'lodash/debounce';
import SceneCard from './scene-card';

import testBgImagePath from './assets/swaps/test-bg.jpg';
import testOverlayImagePath from './assets/swaps/test-overlay.png';


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
  antialias: true
});
renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 1);

// Bring back the console.log
console.log = _consoleLog;

// Set-up scene
const cards: SceneCard[] = [];
(async () => {
  const card = new SceneCard(testBgImagePath, testOverlayImagePath);
  await card.init();

  card.group.rotation.y = 20 * Math.PI / 180;
  const { width: scaleWidth } = fitPlaneToScreen(camera.position.z, camera.fov, width / height);
  card.group.scale.setScalar(scaleWidth);

  cards.push(card);
  scene.add(card.group);
})();


/**
 * Animate
 */
let rAFId: number;
function animate() {
  rAFId = requestAnimationFrame(animate);

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

  const { width: scaleWidth } = fitPlaneToScreen(camera.position.z, camera.fov, width / height);
  cards.forEach(({ group }) => group.scale.setScalar(scaleWidth));

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}, 500);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);


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
