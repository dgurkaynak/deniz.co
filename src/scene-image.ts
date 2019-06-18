import FaceSwapResult from './face-swap-result';
import * as THREE from 'three';
import { canvasToURL } from './utils';
import findIndex from 'lodash/findIndex';
import * as TWEEN from '@tweenjs/tween.js';


const PLANE_SEGMENT_COUNT = [ 50, 50 ];
const NOISE_FACTOR = 0.5;


export default class SceneImage {
  faceSwapResult: FaceSwapResult;

  geometry = new THREE.PlaneGeometry(1, 1, PLANE_SEGMENT_COUNT[0], PLANE_SEGMENT_COUNT[1]);
  baseTexture: THREE.Texture;
  baseMaterial: THREE.MeshBasicMaterial;
  baseMesh: THREE.Mesh;

  overlayTexture: THREE.Texture;
  overlayAlphaMaps: THREE.Texture[];
  overlayMaterials: THREE.MeshBasicMaterial[];
  overlayMeshes: THREE.Mesh[];

  allMeshes: THREE.Mesh[] = [];

  faceVertices: number[][];
  faceBoundingBoxesUV: { x: number, y: number, width: number, height: number }[];

  hoveredFaceIndex = -1;
  faceTweens: { [ key: string ]: TWEEN.Tween } = {};


  constructor(faceSwapResult: FaceSwapResult) {
    this.faceSwapResult = faceSwapResult;
  }


  async init() {
    // Base image (original)
    this.baseTexture = new THREE.Texture(this.faceSwapResult.image);
    this.baseTexture.needsUpdate = true;
    this.baseMaterial = new THREE.MeshBasicMaterial({ map: this.baseTexture, transparent: true });
    this.baseMesh = new THREE.Mesh(this.geometry, this.baseMaterial);
    this.allMeshes.push(this.baseMesh);

    // Overlay image (my faces - swap overlay)
    this.overlayTexture = new THREE.Texture(this.faceSwapResult.overlayImage);
    this.overlayTexture.needsUpdate = true;

    // For each face, create separate mesh for more control
    this.overlayAlphaMaps = [];
    this.overlayMaterials = [];
    this.overlayMeshes = [];

    for (let faceLandmarks of this.faceSwapResult.faces) {
      // Alpha map
      // TODO: THREE.CanvasTexture always updates the canvas, that's why convert canvas to image
      prepareAlphaMask({
        canvas: { width: this.faceSwapResult.width, height: this.faceSwapResult.height },
        opaqueBoundingBox: faceLandmarks.boundingBox,
        scale: 0.25
      });
      const alphaMapImage = new Image();
      alphaMapImage.src = await canvasToURL(alphaMaskCanvas);
      const alphaMapTexture = new THREE.Texture(alphaMapImage);
      alphaMapTexture.needsUpdate = true;
      this.overlayAlphaMaps.push(alphaMapTexture);

      // Material
      const material = new THREE.MeshBasicMaterial({ map: this.overlayTexture, alphaMap: alphaMapTexture, transparent: true });;
      this.overlayMaterials.push(material);

      // Mesh
      const mesh = new THREE.Mesh(this.geometry, material);
      this.overlayMeshes.push(mesh);
      this.allMeshes.push(mesh);
    }

    // Face landmark coordinates to geometry vertice index
    this.faceVertices = this.faceSwapResult.faces.map((faceLandmarks) => {
      return faceLandmarks.points.map(([x, y]) => {
        const verticeX = Math.round(x / this.faceSwapResult.width * PLANE_SEGMENT_COUNT[0]);
        const verticeY = Math.round(y / this.faceSwapResult.height * PLANE_SEGMENT_COUNT[1]);
        return verticeY * (PLANE_SEGMENT_COUNT[0] + 1) + verticeX;
      });
    });


    // Bounding boxes are already calculated in faceLandmark, but they're cartesian coordinates
    // Convert them to UV coordinate system and cache
    const hitAreaIncreaseFactor = 0.5;
    this.faceBoundingBoxesUV = this.faceSwapResult.faces.map((faceLandmark) => {
      const bb = faceLandmark.boundingBox;
      const widthIncrease = bb.width * hitAreaIncreaseFactor;
      const newWidth = bb.width * (1 + hitAreaIncreaseFactor);
      const heightIncrease = bb.height * hitAreaIncreaseFactor;
      const newHeight = bb.height * (1 + hitAreaIncreaseFactor);
      return {
        x: (bb.x - (widthIncrease / 2)) / this.faceSwapResult.width,
        width: newWidth / this.faceSwapResult.width,
        y: 1 - ((bb.y + newHeight - (heightIncrease / 2)) / this.faceSwapResult.height),
        height: newHeight / this.faceSwapResult.height
      };
    });
  }


  onMouseMove(uv: THREE.Vector2) {
    // TODO: Can be multiple matches
    const faceIndex = findIndex(this.faceBoundingBoxesUV, (faceBoundingBoxUV) => {
      return uv.x >= faceBoundingBoxUV.x && uv.x <= (faceBoundingBoxUV.x + faceBoundingBoxUV.width) &&
        uv.y >= faceBoundingBoxUV.y && uv.y <= (faceBoundingBoxUV.y + faceBoundingBoxUV.height);
    });

    if (faceIndex > -1) {
      if (faceIndex == this.hoveredFaceIndex) {
        // no-op
      } else {
        if (this.hoveredFaceIndex > -1) this.onFaceUnhover(this.hoveredFaceIndex);
        this.onFaceHover(faceIndex);
        this.hoveredFaceIndex = faceIndex;
      }
    } else {
      if (this.hoveredFaceIndex > -1) this.onFaceUnhover(this.hoveredFaceIndex);
      this.hoveredFaceIndex = -1;
    }
  }


  private onFaceHover(faceIndex: number) {
    const currentTween = this.faceTweens[faceIndex];
    if (currentTween) currentTween.stop();

    const faceVerticeIndexes = this.faceVertices[faceIndex];

    const tween = new TWEEN.Tween({
      opacity: 1,
      noiseStrength: 0
    }).to({
      opacity: [ 0, 0 ],
      noiseStrength: [ 1, 0 ]
    }, 500);
    this.faceTweens[faceIndex] = tween;

    tween.onUpdate(({ opacity, noiseStrength }) => {
      this.overlayMaterials[faceIndex].opacity = opacity;
      faceVerticeIndexes.forEach((index) => {
        this.geometry.vertices[index].z = Math.random() * NOISE_FACTOR * noiseStrength;
      });
      this.geometry.verticesNeedUpdate = true;
    });

    tween.start();
  }


  private onFaceUnhover(faceIndex: number) {
    const currentTween = this.faceTweens[faceIndex];
    if (currentTween) currentTween.stop();

    const faceVerticeIndexes = this.faceVertices[faceIndex];

    const tween = new TWEEN.Tween({
      opacity: 0,
      noiseStrength: 0
    }).to({
      opacity: [ 1, 1 ],
      noiseStrength: [ 1, 0 ]
    }, 500);
    this.faceTweens[faceIndex] = tween;

    tween.onUpdate(({ opacity, noiseStrength }) => {
      this.overlayMaterials[faceIndex].opacity = opacity;
      faceVerticeIndexes.forEach((index) => {
        this.geometry.vertices[index].z = -Math.random() * NOISE_FACTOR * noiseStrength;
      });
      this.geometry.verticesNeedUpdate = true;
    });

    tween.start();
  }


  dispose() {
    // TODO
  }
}



const alphaMaskCanvas = document.createElement('canvas');
function prepareAlphaMask(options: {
  canvas: {
    width: number,
    height: number
  },
  opaqueBoundingBox: {
    x: number,
    y: number,
    width: number,
    height: number
  },
  scale: number
}) {
  alphaMaskCanvas.width = options.canvas.width * options.scale;
  alphaMaskCanvas.height = options.canvas.height * options.scale;
  const cc = alphaMaskCanvas.getContext('2d');

  cc.fillStyle = '#000';
  cc.fillRect(0, 0, options.canvas.width * options.scale, options.canvas.height * options.scale);

  cc.fillStyle = '#fff';
  cc.fillRect(
    options.opaqueBoundingBox.x * options.scale,
    options.opaqueBoundingBox.y * options.scale,
    options.opaqueBoundingBox.width * options.scale,
    options.opaqueBoundingBox.height * options.scale
  );
}
