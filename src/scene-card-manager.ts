import * as THREE from 'three';
import SceneCard from './scene-card';
import { timingSafeEqual } from 'crypto';


export default class SceneCardManager {
  allCards: SceneCard[];
  onScreenCards: SceneCard[] = [];
  camera: THREE.PerspectiveCamera;
  viewport = { width: 0, height: 0 };
  scene: THREE.Scene;
  screen = { width: 0, height: 0 };

  private initialLoadCount = 2;


  constructor(options: {
    camera: THREE.PerspectiveCamera,
    cards: SceneCard[]
    scene: THREE.Scene,
    screenWidth: number,
    screenHeight: number,
  }) {
    this.allCards = options.cards;
    this.camera = options.camera;
    this.scene = options.scene;
    this.setScreenSize(options.screenWidth, options.screenHeight);
  }


  async init() {
    const firstCards = this.allCards.slice(0, this.initialLoadCount);
    const initTasks = firstCards.map(c => c.init());
    await Promise.all(initTasks);

    firstCards.forEach((card, i) => {
      const y = i == 0 ?
        -this.viewport.height / 2 :
        this.lastCardBottom - 0.05; // 0.05 is the little offset
      this.putCardOnScreen(card, y);
    });
  }


  get firstCard() { // on screen
    return this.onScreenCards[0];
  }


  get firstCardBottom() {
    return this.firstCard.bgMesh.position.y - (this.firstCard.bgMesh.scale.y / 2);
  }


  get lastCard() { // on screen
    return this.onScreenCards[this.onScreenCards.length - 1];
  }


  get lastCardBottom() {
    return this.lastCard.bgMesh.position.y - (this.lastCard.bgMesh.scale.y / 2);
  }


  get viewportTop() {
    return this.camera.position.y + (this.viewport.height / 2);
  }


  get viewportBottom() {
    return this.camera.position.y - (this.viewport.height / 2);
  }


  putCardOnScreen(card: SceneCard, y: number) {
    // Determine card size
    const cardScale = Math.min(
      this.viewport.width,
      this.viewport.height * card.aspectRatio
    ); // actually width (because card size is 1x1)
    const cardScaleY = cardScale / card.aspectRatio; // actually height (because card size is 1x1)

    // Offset self-half
    y -= cardScaleY / 2;

    card.forEachMesh((m) => {
      // m.rotation.y = 30 * Math.PI / 180;
      m.scale.setX(cardScale);
      m.scale.setY(cardScaleY);
      m.position.setY(y);
    });

    this.scene.add(card.group);
    this.onScreenCards.push(card);
  }


  async update() {
    if (this.firstCardBottom > (this.viewportTop + (this.viewport.height / 2))) {
      // Remove the first card
      const firstCard = this.firstCard;
      this.scene.remove(firstCard.group);
      this.onScreenCards.splice(0, 1);
    }

    if (this.lastCardBottom > (this.viewportBottom - (this.viewport.height / 2))) {
      // Lazy load the next one
      const lastCardIndex = this.allCards.indexOf(this.lastCard);
      const nextCardIndex = (lastCardIndex + 1) % this.allCards.length;
      const nextCard = this.allCards[nextCardIndex];
      await nextCard.init();
      const y = this.lastCardBottom - 0.05; // 0.05 is the little offset
      this.putCardOnScreen(nextCard, y);
    }
  }



  setScreenSize(width: number, height: number) {
    this.screen.width = width;
    this.screen.height = height;
    this.updateViewport();
  }


  updateViewport() {
    this.viewport = fitPlaneToScreen(
      this.camera.position.z,
      this.camera.fov,
      this.screen.width / this.screen.height
    );
  }
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
