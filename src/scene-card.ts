import * as THREE from 'three';
import FaceSwapResult from './face-swap-result';
import { loadImage } from './utils';


const PLANE_SEGMENT_COUNT = [ 40, 30 ];


export default class SceneCard {
  group = new THREE.Group();
  aspectRatio: number;
  isInited = false;

  private geometry: THREE.PlaneGeometry;
  private bgMaterial: THREE.MeshBasicMaterial;
  private bgTexture: THREE.Texture;
  public bgMesh: THREE.Mesh;
  private faceOverlayMaterial: THREE.MeshBasicMaterial;
  private faceOverlayTexture: THREE.Texture;
  public faceOverlayMesh: THREE.Mesh;

  private frustum = new THREE.Frustum();
  private cameraViewProjectionMatrix = new THREE.Matrix4();


  constructor(
    public faceSwapResult?: FaceSwapResult,
    private faceSwapResultGetter?: () => Promise<FaceSwapResult>
  ) {
    if (!this.faceSwapResult && !this.faceSwapResultGetter) {
      throw new Error('If face swap result is not provided, getter method must be');
    }
  }


  async init() {
    if (this.isInited) {
      return;
    }

    if (!this.faceSwapResult) {
      this.faceSwapResult = await this.faceSwapResultGetter();
    }

    this.aspectRatio = this.faceSwapResult.originalWidth / this.faceSwapResult.originalHeight;

    this.bgTexture = new THREE.Texture(this.faceSwapResult.image);
    this.bgTexture.needsUpdate = true;
    this.faceOverlayTexture = new THREE.Texture(this.faceSwapResult.overlayImage);
    this.faceOverlayTexture.needsUpdate = true;

    this.geometry = new THREE.PlaneGeometry(1, 1, PLANE_SEGMENT_COUNT[0], PLANE_SEGMENT_COUNT[1]);

    this.bgMaterial = new THREE.MeshBasicMaterial({ map: this.bgTexture, transparent: true });
    this.faceOverlayMaterial = new THREE.MeshBasicMaterial({ map: this.faceOverlayTexture, transparent: true, opacity: 1 });
    this.bgMesh = new THREE.Mesh(this.geometry, this.bgMaterial);
    this.faceOverlayMesh = new THREE.Mesh(this.geometry, this.faceOverlayMaterial);

    this.group.add(this.bgMesh, this.faceOverlayMesh);

    this.isInited = true;
  }


  forEachMesh(handler: (mesh: THREE.Mesh) => any) {
    const meshes = [ this.bgMesh, this.faceOverlayMesh ];
    meshes.forEach(handler);
  }


  checkVisibility(camera: THREE.Camera) {
    camera.updateMatrixWorld(false);
    camera.matrixWorldInverse.getInverse(camera.matrixWorld);
    this.cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromMatrix(this.cameraViewProjectionMatrix);

    return this.frustum.intersectsObject(this.bgMesh);
  }


  dispose() {
    this.bgMaterial.dispose();
    this.bgTexture.dispose();
    this.faceOverlayMaterial.dispose();
    this.faceOverlayTexture.dispose();
    this.geometry.dispose();
  }
}
