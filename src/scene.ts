import * as THREE from 'three';
import throttle from 'lodash/throttle';
import * as TWEEN from '@tweenjs/tween.js';
import Stats from 'stats.js';
import Animator from './animator';
import FaceSwapResult from './face-swap-result';
import { loadImage, sleep } from './utils';
import FaceLandmarks from './face-landmarks';
import SceneImage from './scene-image';
import { getNext as getNextPreprocessedImageData } from './preprocessed-data';
import * as HeadingText from './heading-text';
import GestureHandler from './gesture-handler';
import { disableBodyScroll } from 'body-scroll-lock';
import * as BottomText from './bottom-text';




// Consts
const IMAGE_ANIMATE_IN_DURATION = 1000;
const IMAGE_ANIMATE_OUT_DURATION = 1000;
const IMAGE_ANIMATE_BACK_TO_CENTER_DURATION = 100;
const IMAGE_DISTANCE_FROM_CAMERA = 1;
const IMAGE_ZOOM_Z = 0.5;
const IMAGE_ZOOM_ANIMATE_DURATION = 250;
const ANIMATOR_EXTRA_DURATION = 500; // Some times tween.onComplete does not fire.


// Disable body scroll
disableBodyScroll(document.body);

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
console.warn = () => {}; // Disables three.js's texture size warning

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

// DOM elements
const mainElement = document.getElementById('main');
const headingTextElement = document.getElementById('heading-text');
// About button
const aboutButtonElement = document.createElement('span');
aboutButtonElement.id = 'about-button';
aboutButtonElement.textContent = 'About';

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
const raycastingTargetScreenPosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// Set-up scene
const gestureHandler = new GestureHandler(canvas);
GestureHandler.setSingleton(gestureHandler);
const textureSize = Math.max(width, height) * window.devicePixelRatio;
let pixelToThreeUnitFactor: { x: number, y: number }; // will be updated on resize
let imagePlaneViewport: { width: number, height: number }; // will be updated on resize

let sceneImage: SceneImage;
let isNewImageLoading = false;
let isPanning = false;
let imageTweenBackToCenter: TWEEN.Tween;
let sceneImageZoomTween: TWEEN.Tween;

let swapHelperPreparePromise: Promise<void>;
let swapHelper: {
  init(): Promise<void>,
  processImage(imageFile: File): Promise<FaceSwapResult>
};

/**
 * Main function
 */
async function main() {
  // Print github repo to console
  console.log(
    '%cHey there, if you\'re interested: source code of this website is avaliable on https://github.com/dgurkaynak/deniz.co',
    'font-size: 16px;'
  );

  // Three dot loading animation is started in index, so not start again
  const [newScene] = await Promise.all([
    prepareNextPreprocessImage(),
    HeadingText.prepareBaffleIfNecessary()
  ]);
  mainElement.insertBefore(aboutButtonElement, headingTextElement.nextSibling);
  mainElement.classList.remove('opened');
  HeadingText.stopThreeDotLoading();
  HeadingText.baffleReveal(newScene.imageData.headingText, IMAGE_ANIMATE_IN_DURATION);
  await addAndSlideInImage(newScene.sceneImage);
  sceneImage = newScene.sceneImage;

  sceneImage.setupAutoWiggle();

  imagePlaneViewport = fitPlaneToScreen(camera.position.z - IMAGE_DISTANCE_FROM_CAMERA, camera.fov, width / height);
  pixelToThreeUnitFactor = {
    x: imagePlaneViewport.width / width,
    y: imagePlaneViewport.height / height
  };

  // TODO: Check face-api.js is working
  BottomText.init(onFilesDroppedOrSelected);
}


/**
 * Fetches data json and images, creates & returns prepared SceneImage.
 */
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

  return {
    sceneImage,
    imageData
  };
}


/**
 * Adds sceneImage to the scene and animates sliding from left.
 */
async function addAndSlideInImage(sceneImage: SceneImage) {
  const viewport = fitPlaneToScreen(camera.position.z, camera.fov, width / height);
  const cardScale = fitFaceSwapResultToScreen(sceneImage.faceSwapResult);

  sceneImage.group.scale.setX(cardScale.x);
  sceneImage.group.scale.setY(cardScale.y);
  sceneImage.group.position.x = -viewport.width;

  scene.add(sceneImage.group);

  const tween = new TWEEN.Tween({ x: -viewport.width }).to({ x: 0 }, IMAGE_ANIMATE_IN_DURATION);
  tween.easing(TWEEN.Easing.Exponential.InOut);

  return new Promise((resolve) => {
    tween.onUpdate(({ x }) => { sceneImage.group.position.x = x; });
    tween.onComplete(() => resolve());

    tween.start();
    Animator.getGlobal().start(IMAGE_ANIMATE_IN_DURATION + ANIMATOR_EXTRA_DURATION);
  });
}


/**
 * Slides out the image, then remove it from scene and dispose it.
 */
async function slideOutAndDisposeImage(sceneImage: SceneImage) {
  const viewport = fitPlaneToScreen(camera.position.z, camera.fov, width / height);

  const tween = new TWEEN.Tween({ x: 0 }).to({ x: viewport.width * 1 }, IMAGE_ANIMATE_OUT_DURATION);
  tween.easing(TWEEN.Easing.Exponential.InOut);

  return new Promise((resolve) => {
    tween.onUpdate(({ x }) => { sceneImage.group.position.x = x; });
    tween.onComplete(() => {
      scene.remove(sceneImage.group);
      sceneImage.dispose();
      resolve();
    });

    tween.start();
    Animator.getGlobal().start(IMAGE_ANIMATE_OUT_DURATION + ANIMATOR_EXTRA_DURATION);
  });
}


/**
 * Grabbed image is not throwed, animate back into center.
 */
async function animateImageBackToCenter(sceneImage: SceneImage) {
  const tween = new TWEEN.Tween({
    posX: sceneImage.group.position.x,
    posY: sceneImage.group.position.y,
    rotY: sceneImage.group.rotation.y,
    rotZ: sceneImage.group.rotation.z
  }).to({ posX: 0, posY: 0, rotY: 0, rotZ: 0 }, IMAGE_ANIMATE_BACK_TO_CENTER_DURATION);
  imageTweenBackToCenter = tween;

  return new Promise((resolve) => {
    tween.onUpdate(({ posX, posY, rotY, rotZ }) => {
      sceneImage.group.position.x = posX;
      sceneImage.group.position.y = posY;
      sceneImage.group.rotation.y = rotY;
      sceneImage.group.rotation.z = rotZ;
    });
    tween.onComplete(() => {
      imageTweenBackToCenter = null;
      resolve();
    });

    tween.start();
    Animator.getGlobal().start(IMAGE_ANIMATE_BACK_TO_CENTER_DURATION + ANIMATOR_EXTRA_DURATION);
  });
}


/**
 * Image is throwed, animate out by throw direction.
 * Then, remove it from scene and dispose.
 */
async function throwAnimateAndDispose(sceneImage: SceneImage, throwData: { velocity: number, angle: number }) {
  const viewport = fitPlaneToScreen(camera.position.z, camera.fov, width / height);

  let targetX: number;
  let targetY: number;
  let duration: number;

  // Now we have 2 options:
  // 1) Offset x dimension with viewport width
  // 2) Offset y dimension with viewport height
  // If we just one x-dimension offsetting and user throwed the image ~90 degrees
  // up/down reaching that x offset will take a long time. So choose shorter one.

  let option1: { targetX: number, targetY: number, duration: number };
  let option2: { targetX: number, targetY: number, duration: number };

  // Option 1) Offset x-dimension with viewport width
  {
    const sign = sceneImage.group.position.x >= 0 ? 1 : -1;
    const offsetX = sign * viewport.width;
    const targetX = sceneImage.group.position.x + offsetX;
    const offsetY = offsetX * Math.tan(throwData.angle);
    const targetY = sceneImage.group.position.y + offsetY;
    const totalOffset = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const pixelToThreeUnitTotal = Math.sqrt(Math.pow(pixelToThreeUnitFactor.x, 2) + Math.pow(pixelToThreeUnitFactor.y, 2));
    const duration = Math.round(totalOffset / (throwData.velocity * pixelToThreeUnitTotal));
    option1 = { targetX, targetY, duration };
  }

  // Options 2) Offset y-dimension with viewport height
  {
    const sign = sceneImage.group.position.y >= 0 ? 1 : -1;
    const offsetY = sign * viewport.height;
    const targetY = sceneImage.group.position.y + offsetY;
    const offsetX = offsetY / Math.tan(throwData.angle);
    const targetX = sceneImage.group.position.x + offsetX;
    const totalOffset = Math.sqrt(Math.pow(offsetX, 2) + Math.pow(offsetY, 2));
    const pixelToThreeUnitTotal = Math.sqrt(Math.pow(pixelToThreeUnitFactor.x, 2) + Math.pow(pixelToThreeUnitFactor.y, 2));
    const duration = Math.round(totalOffset / (throwData.velocity * pixelToThreeUnitTotal));
    option2 = { targetX, targetY, duration };
  }

  // Choose shorter one
  if (option1.duration < option2.duration) {
    targetX = option1.targetX;
    targetY = option1.targetY;
    duration = option1.duration;
  } else {
    targetX = option2.targetX;
    targetY = option2.targetY;
    duration = option2.duration;
  }

  const tween = new TWEEN.Tween({
    x: sceneImage.group.position.x,
    y: sceneImage.group.position.y
  }).to({ x: targetX, y: targetY }, duration);

  return new Promise((resolve) => {
    tween.onUpdate(({ x, y }) => {
      sceneImage.group.position.x = x;
      sceneImage.group.position.y = y;
      sceneImage.group.rotation.y = (x / imagePlaneViewport.width) * Math.PI / 2;
      sceneImage.group.rotation.z = (y / imagePlaneViewport.height) * Math.PI / 2;
    });
    tween.onComplete(() => {
      scene.remove(sceneImage.group);
      sceneImage.dispose();
      resolve();
    });

    tween.start();
    Animator.getGlobal().start(duration + ANIMATOR_EXTRA_DURATION);
  });
}


/**
 * Listen "about" button click
 */
aboutButtonElement.addEventListener('click', () => {
  const isOpened = mainElement.classList.contains('opened');
  setAboutTextVisibility(!isOpened);
}, false);


/**
 * Open/collapse header to show/hide about text
 */
function setAboutTextVisibility(isVisible: boolean) {
  const isOpened = mainElement.classList.contains('opened');

  if (isVisible) {
    if (isOpened) return;
    mainElement.classList.add('opened');
    aboutButtonElement.textContent = 'Close';
    HeadingText.lock();
  } else {
    if (!isOpened) return;
    mainElement.classList.remove('opened');
    aboutButtonElement.textContent = 'About';
    HeadingText.unlock();
  }
}


/**
 * Animate
 */
const animator = new Animator((time) => {
  stats && stats.begin();
  (TWEEN as any).default.update(time);
  renderer.render(scene, camera);
  stats && stats.end();
});
Animator.setGlobal(animator);


/**
 * General mouse-move handler. Actually listen for `pointermove` event,
 * because touch events also generates `mousemove` event.
 */
const onMouseMove = throttle((e: PointerEvent) => {
  // Reset the cursor anyway
  canvas.classList.remove('set-cursor');

  if (!sceneImage) return;

  // Only allow mouse events (ignore touch events)
  if (e.pointerType != 'mouse') {
    return;
  }

  const x = e.clientX;
  const y = e.clientY;

  // Tilt effect
  const rotationX = ((y / height) - 0.5) * (15 * Math.PI / 180);
  const rotationY = ((x / width) - 0.5) * (30 * Math.PI / 180);
  sceneImage.group.rotation.x = rotationX;
  sceneImage.group.rotation.y = rotationY;

  // Check mouse whether on a face or not
  updateRayCasting(x, y);
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length > 0) {
    sceneImage.onMouseMove(intersects[0].uv);
    canvas.classList.add('set-cursor');

    // Animate scene image to zoom in
    sceneImageZoomTween && sceneImageZoomTween.stop();
    sceneImageZoomTween = new TWEEN.Tween({ z: sceneImage.group.position.z }).to({ z: IMAGE_ZOOM_Z }, IMAGE_ZOOM_ANIMATE_DURATION);
    sceneImageZoomTween.easing(TWEEN.Easing.Quartic.Out);
    sceneImageZoomTween.onUpdate(({ z }) => { sceneImage.group.position.z = z; });
    sceneImageZoomTween.start();
    Animator.getGlobal().start(IMAGE_ZOOM_ANIMATE_DURATION + ANIMATOR_EXTRA_DURATION);
  } else {
    // Animate scene image to zoom out
    sceneImageZoomTween && sceneImageZoomTween.stop();
    sceneImageZoomTween = new TWEEN.Tween({ z: sceneImage.group.position.z }).to({ z: 0 }, IMAGE_ZOOM_ANIMATE_DURATION);
    sceneImageZoomTween.easing(TWEEN.Easing.Quartic.Out);
    sceneImageZoomTween.onUpdate(({ z }) => { sceneImage.group.position.z = z; });
    sceneImageZoomTween.start();
    Animator.getGlobal().start(IMAGE_ZOOM_ANIMATE_DURATION + ANIMATOR_EXTRA_DURATION);
  }

  animator.step();
}, 20);
if ((window as any).PointerEvent) {
  document.body.addEventListener('pointermove', onMouseMove, false);
} else {
  // Pointer event is not supported,
  document.body.addEventListener('mousemove', (e) => {
    // Prevent touch-triggered mousemove events when about button clicked
    if (e.target == aboutButtonElement) return;
    else if (e.target == BottomText.fileInputElement) return;

    onMouseMove({
      pointerType: 'mouse',
      clientX: e.clientX,
      clientY: e.clientY
    } as PointerEvent);
  }, false);
}


/**
 * Loads next scene image.
 */
async function loadNextSceneImage() {
  if (isNewImageLoading) return;
  isNewImageLoading = true;

  const oldSceneImage = sceneImage;
  sceneImage = null;

  // Reset the cursor
  canvas.classList.remove('set-cursor');

  // Stop the zoom animation if existing
  sceneImageZoomTween && sceneImageZoomTween.stop();
  sceneImageZoomTween = null;

  // If we've just closed about text just above, `baffle.reveal` method will run on next tick.
  // So, in order to override baffle.reveal command, we also start baffling on the next tick.
  setTimeout(() => {
    HeadingText.startBaffling();
  }, 0);

  const [ newScene ] = await Promise.all([
    prepareNextPreprocessImage(),
    slideOutAndDisposeImage(oldSceneImage)
  ]);

  HeadingText.baffleReveal(newScene.imageData.headingText, IMAGE_ANIMATE_IN_DURATION);
  await addAndSlideInImage(newScene.sceneImage);
  sceneImage = newScene.sceneImage;
  isNewImageLoading = false;
  sceneImage.setupAutoWiggle();
}


/**
 * Canvas element mouse-click handler. Actually listen for `pointerdown` event
 * instead of `click`, because touch devices also fires `click` event. We want to
 * seperate that.
 */
async function onCanvasClick(e: PointerEvent) {
  // Only allow mouse move events (ignore touch events)
  if (e.pointerType != 'mouse') {
    return;
  }

  // Only allow main (left) button
  if (e.button != 0) return;

  setAboutTextVisibility(false);

  // Defensive
  if (!sceneImage) return;

  // If not clicked on image, do not change
  updateRayCasting(e.clientX, e.clientY);
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length == 0) return;

  await loadNextSceneImage();
}
if ((window as any).PointerEvent) {
  canvas.addEventListener('pointerup', onCanvasClick, false);
} else {
  // Pointer event is not supported,
  canvas.addEventListener('mouseup', (e) => {
    onCanvasClick({
      pointerType: 'mouse',
      button: e.button,
      clientX: e.clientX,
      clientY: e.clientY
    } as PointerEvent);
  }, false);

  // Prevent touch-triggered mousedown events
  canvas.addEventListener('touchend', e => e.preventDefault());
}


/**
 * Listen for tap event on canvas.
 */
gestureHandler.onTap = ({ x, y }) => {
  if (!sceneImage) return;

  // Check whether tapped on a face or not
  updateRayCasting(x, y);
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length > 0) {
    sceneImage.toggleAllFaces();
    animator.step();
  }
};


/**
 * Listen for touch start event to grab image
 */
gestureHandler.onTouchStart = (e) => {
  const changedTouch = e.changedTouches[0];
  setAboutTextVisibility(false);

  // Check mouse whether on a face or not
  updateRayCasting(changedTouch.pageX, changedTouch.pageY);
  const intersects = raycaster.intersectObject(sceneImage.baseMesh);
  if (intersects.length > 0) {
    isPanning = true;

    // If there is ongoing tween back to center, stop it
    imageTweenBackToCenter && imageTweenBackToCenter.stop();
  }
};


/**
 * Listen for touch move events to grab image
 */
gestureHandler.onPan = (e, delta) => {
  if (!isPanning) return;

  // Position
  sceneImage.group.position.x += delta.x * pixelToThreeUnitFactor.x;
  sceneImage.group.position.y -= delta.y * pixelToThreeUnitFactor.y; // three.js, y is inverted

  // Rotation
  sceneImage.group.rotation.y = (sceneImage.group.position.x / imagePlaneViewport.width) * Math.PI / 2;
  sceneImage.group.rotation.z = (sceneImage.group.position.y / imagePlaneViewport.height) * Math.PI / 2;

  animator.step();
};


/**
 * Listen for touch end event
 */
gestureHandler.onTouchEnd = async (e, throwData) => {
  isPanning = false;
  if (!sceneImage) return;

  if (throwData) {
    isNewImageLoading = true;

    const oldsceneImage = sceneImage;
    sceneImage = null;

    HeadingText.startBaffling();

    const [ newScene ] = await Promise.all([
      prepareNextPreprocessImage(),
      throwAnimateAndDispose(oldsceneImage, throwData)
    ]);

    HeadingText.baffleReveal(newScene.imageData.headingText, IMAGE_ANIMATE_IN_DURATION);
    await addAndSlideInImage(newScene.sceneImage);
    sceneImage = newScene.sceneImage;
    isNewImageLoading = false;
    sceneImage.setupAutoWiggle();
  } else {
    animateImageBackToCenter(sceneImage);
  }
};


/**
 * Listen for keyboard arrow keys
 */
const onKeyDown = (e: KeyboardEvent) => {
  const KeyCode = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  };

  switch(e.keyCode) {
    case KeyCode.RIGHT: {
      loadNextSceneImage();
      return;
    }

    case KeyCode.DOWN: {
      setAboutTextVisibility(true);
      return;
    }

    case KeyCode.UP: {
      setAboutTextVisibility(false);
      return;
    }
  }
};
document.addEventListener('keydown', onKeyDown, false);


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

  imagePlaneViewport = fitPlaneToScreen(camera.position.z - IMAGE_DISTANCE_FROM_CAMERA, camera.fov, width / height);
  pixelToThreeUnitFactor = {
    x: imagePlaneViewport.width / width,
    y: imagePlaneViewport.height / height
  };

  if (sceneImage) {
    const cardScale = fitFaceSwapResultToScreen(sceneImage.faceSwapResult);
    sceneImage.group.scale.setX(cardScale.x);
    sceneImage.group.scale.setY(cardScale.y);
  }

  animator.step();
}, 500);
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('orientationchange', onWindowResize, false);


async function prepareSwapHelperIfNecessary() {
  if (swapHelperPreparePromise) return swapHelperPreparePromise;
  swapHelperPreparePromise = new Promise(async (resolve, reject) => {
    try {
      swapHelper = await import(/* webpackChunkName: "scene-swap-helper" */ './scene-swap-helper');
      await swapHelper.init();
      resolve();
    } catch (err) {
      // Clear promise, so it can be re-tried
      swapHelperPreparePromise = null;

      reject(err);
    }
  });
  return swapHelperPreparePromise;
}


/**
 * Listen dragover event for drag&drop
 */
function onDragOver(event: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';

  prepareSwapHelperIfNecessary();
}
document.body.addEventListener('dragover', onDragOver);


/**
 * Listen drop event for drag&drop
 */
async function onDrop(event: DragEvent) {
  // Prevent default behavior (Prevent file from being opened)
  event.preventDefault();

  if (event.dataTransfer.files) {
    onFilesDroppedOrSelected(event.dataTransfer.files);
  } else {
    BottomText.setStateNotSupportedBrowser();
  }
}
document.body.addEventListener('drop', onDrop);


/**
 * Main method for drag & drop or file-input selection.
 */
async function onFilesDroppedOrSelected(fileList: FileList) {
  if (isNewImageLoading) return;
  isNewImageLoading = true;

  BottomText.setStateProcessing();
  await prepareSwapHelperIfNecessary();

  const images: { name: string, file: File }[] = [];
  // Use DataTransferItemList interface to access the file(s)
  for (let i = 0; i < fileList.length; i++) {
    // If dropped items aren't files, reject them
    const file = fileList[i];
    if (file.type.split('/')[0] == 'image') {
      images.push({
        name: file.name,
        file
      });
    }
  }

  if (images.length == 0) {
    await BottomText.displayTemporaryMessage('You must drag & drop an image file', 3000);
    BottomText.setStateIdle();
    isNewImageLoading = false;
    return;
  }

  const faceSwapResult = await swapHelper.processImage(images[0].file);

  if (faceSwapResult.faces.length == 0) {
    await BottomText.displayTemporaryMessage('No face found :/', 3000);
    BottomText.setStateIdle();
    isNewImageLoading = false;
    return;
  }

  const newSceneImage = new SceneImage(faceSwapResult);

  const oldSceneImage = sceneImage;
  sceneImage = null;

  HeadingText.startBaffling();
  await Promise.all([
    newSceneImage.init(),
    slideOutAndDisposeImage(oldSceneImage)
  ]);

  // TODO: Prepare random messages for custom
  HeadingText.baffleReveal('Voila', IMAGE_ANIMATE_IN_DURATION);
  await addAndSlideInImage(newSceneImage);

  sceneImage = newSceneImage;
  isNewImageLoading = false;

  sceneImage.setupAutoWiggle();

  BottomText.setStateIdle();
}


function updateRayCasting(x: number, y: number) {
  raycastingTargetScreenPosition.x = (x / width) * 2 - 1;
  raycastingTargetScreenPosition.y = -(y / height) * 2 + 1;
  raycaster.setFromCamera(raycastingTargetScreenPosition, camera);
}


function fitFaceSwapResultToScreen(swapResult: FaceSwapResult) {
  const imagePlaneViewport = fitPlaneToScreen(camera.position.z - IMAGE_DISTANCE_FROM_CAMERA, camera.fov, width / height);
  const aspectRatio = swapResult.originalWidth / swapResult.originalHeight;

  const cardScale = Math.min(
    imagePlaneViewport.width,
    imagePlaneViewport.height * aspectRatio
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
