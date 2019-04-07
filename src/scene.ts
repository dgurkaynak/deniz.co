import * as THREE from 'three';
import debounce from 'lodash/debounce';


// Set-up the canvas
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementsByTagName('canvas')[0];
const { offsetWidth: width, offsetHeight: height } = canvasContainer;
canvas.width = width;
canvas.height = height;

// Scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

// Disable three.js's console message the hard way
// Kehehe https://github.com/mrdoob/three.js/pull/5835
const _consoleLog = console.log;
console.log = () => {};

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: window.devicePixelRatio == 1
});
renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 1);

// Bring back the console.log
console.log = _consoleLog;

// Set-up scene
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xfffff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


/**
 * Animate
 */
let rAFId: number;
function animate() {
  rAFId = requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

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
}, 500);
window.addEventListener('resize', onWindowResize, false);


/**
 * Keep the environment clean & beatiful
 */
function dispose() {
  cancelAnimationFrame(rAFId);
  geometry.dispose();
  material.dispose();
}


/**
 * Go go go
 */
animate();
