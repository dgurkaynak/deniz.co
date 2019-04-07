import * as THREE from 'three';
import debounce from 'lodash/debounce';


// Fix canvas size
const canvas = document.getElementsByTagName('canvas')[0];
const { offsetWidth: width, offsetHeight: height } = canvas;
canvas.width = width;
canvas.height = height;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Set-up scene
// Ahahaha: https://github.com/mrdoob/three.js/pull/5835
const _consoleLog = console.log;
console.log = () => {};
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: window.devicePixelRatio == 1
});
console.log = _consoleLog;

renderer.setSize(width, height);
renderer.setClearColor(0xffffff, 1);
camera.position.z = 5;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xfffff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
	requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

const onWindowResize = debounce(() => {
  const { offsetWidth: width, offsetHeight: height } = canvas;
  canvas.width = width;
  canvas.height = height;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}, 500);

window.addEventListener('resize', onWindowResize, false);

animate();

