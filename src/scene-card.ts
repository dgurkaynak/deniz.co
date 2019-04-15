import * as THREE from 'three';
import FaceSwapResult from './face-swap-result';
import { loadImage } from './utils';


const PLANE_SEGMENT_COUNT = [ 40, 30 ];
const PLANE_MAX_SIZE = [ 1, 0.75 ];


export default class SceneCard {
  group = new THREE.Group();

  private geometry: THREE.PlaneGeometry;
  private bgMaterial: THREE.MeshBasicMaterial;
  private bgTexture: THREE.Texture;
  private bgMesh: THREE.Mesh;
  private faceOverlayMaterial: THREE.MeshBasicMaterial;
  private faceOverlayTexture: THREE.Texture;
  private faceOverlayMesh: THREE.Mesh;

  private frustum = new THREE.Frustum();
  private cameraViewProjectionMatrix = new THREE.Matrix4();


  constructor(public faceSwapResult: FaceSwapResult) {
    // TODO
  }


  async init() {
    this.bgTexture = new THREE.Texture(this.faceSwapResult.image);
    this.bgTexture.needsUpdate = true;
    this.faceOverlayTexture = new THREE.Texture(this.faceSwapResult.overlayImage);
    this.faceOverlayTexture.needsUpdate = true;

    const { originalWidth: width, originalHeight: height } = this.faceSwapResult;

    const scaleToFullWidth = PLANE_MAX_SIZE[0] / width;
    const scaleToFullHeight = PLANE_MAX_SIZE[1] / height;
    const scaleFactor = Math.min(scaleToFullWidth, scaleToFullHeight);

    // TODO: Frame positioning
    this.geometry = new THREE.PlaneGeometry(
      width * scaleFactor,
      height * scaleFactor,
      PLANE_SEGMENT_COUNT[0],
      PLANE_SEGMENT_COUNT[1]
    );

    this.bgMaterial = new THREE.MeshBasicMaterial({ map: this.bgTexture, transparent: true });
    this.faceOverlayMaterial = new THREE.MeshBasicMaterial({ map: this.faceOverlayTexture, transparent: true, opacity: 1 });
    this.bgMesh = new THREE.Mesh(this.geometry, this.bgMaterial);
    this.faceOverlayMesh = new THREE.Mesh(this.geometry, this.faceOverlayMaterial);

    this.group.add(this.bgMesh, this.faceOverlayMesh);
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
