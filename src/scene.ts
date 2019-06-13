import * as THREE from 'three';
import debounce from 'lodash/debounce';
import find from 'lodash/find';

import acdcBaseImagePath from './assets/preprocessed/acdc/1024x1024/base.png';
import acdcOverlayImagePath from './assets/preprocessed/acdc/1024x1024/overlay.png';
import acdcData from './assets/preprocessed/acdc/1024x1024/data.json';
import FaceSwapResult from './face-swap-result';
import { loadImage } from './utils';
import FaceLandmarks from './face-landmarks';


// Constants
const PLANE_SEGMENT_COUNT = [ 40, 30 ];

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

// Ray casting stuff
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Set-up scene
const geometry = new THREE.PlaneGeometry(1, 1, PLANE_SEGMENT_COUNT[0], PLANE_SEGMENT_COUNT[1]);
let image: {
  texture: THREE.Texture,
  material: THREE.MeshBasicMaterial,
  mesh: THREE.Mesh
};
let overlayImage: {
  texture: THREE.Texture,
  material: THREE.MeshBasicMaterial,
  mesh: THREE.Mesh
};
let swapResult: FaceSwapResult;

/**
 * Main function
 */
async function main() {
  const faceLandmarksArr = acdcData.faces.map((rawFaceData: any) => {
    return new FaceLandmarks(rawFaceData.points);
  });
  swapResult = new FaceSwapResult(
    await loadImage(acdcBaseImagePath),
    await loadImage(acdcOverlayImagePath),
    faceLandmarksArr,
    acdcData.originalWidth,
    acdcData.originalHeight
  );


  {
    const texture = new THREE.Texture(swapResult.image);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    image = { texture, material, mesh };
  }

  {
    const texture = new THREE.Texture(swapResult.overlayImage);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    overlayImage = { texture, material, mesh };
  }

  const viewport = fitPlaneToScreen(camera.position.z - 1, camera.fov, width / height);
  const aspectRatio = swapResult.originalWidth / swapResult.originalHeight;

  const cardScale = Math.min(
    viewport.width,
    viewport.height * aspectRatio
  ); // actually width (because card size is 1x1)
  const cardScaleY = cardScale / aspectRatio; // actually height (because card size is 1x1)

  [ image.mesh, overlayImage.mesh ].forEach((m) => {
    m.scale.setX(cardScale);
    m.scale.setY(cardScaleY);
  });

  (window as any).imageMesh = image.mesh;
}



/**
 * Animate
 */
let rAFId: number;
let frameCount = 0;
function animate() {
  rAFId = requestAnimationFrame(animate);
  frameCount++;

  renderer.render(scene, camera);
}


/**
 * Listen mouse move event
 * TODO: Touch events
 */
const onMouseMove = debounce((e: MouseEvent) => {
  if (!image || !overlayImage) return;
  const { clientX: x, clientY: y } = e;
  const { innerWidth: width, innerHeight: height } = window;
  const rotationX = ((y / height) - 0.5) * (15 * Math.PI / 180);
  const rotationY = ((x / width) - 0.5) * (30 * Math.PI / 180);
  [ image.mesh, overlayImage.mesh ].forEach((m) => {
    m.rotation.x = rotationX;
    m.rotation.y = rotationY;
  });


  // Update mouse position and raycaster
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mousePosition, camera);

  // Check mouse whether on a face or not
  // TODO: Do this maybe more throttled way?
  const intersects = raycaster.intersectObject(image.mesh);
  if (intersects.length > 0) {
    const uv = intersects[0].uv;
    const match = find(swapResult.faceBoundingBoxesUV, (faceBoundingBoxUV) => {
      return uv.x >= faceBoundingBoxUV.x && uv.x <= (faceBoundingBoxUV.x + faceBoundingBoxUV.width) &&
        uv.y >= faceBoundingBoxUV.y && uv.y <= (faceBoundingBoxUV.y + faceBoundingBoxUV.height);
    });
    // console.log('match', match);
  }
}, 5);
document.body.addEventListener('mousemove', onMouseMove, false);


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
  .then(() => animate())
  .catch((err) => console.error(err));
