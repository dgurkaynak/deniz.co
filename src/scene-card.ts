import * as THREE from 'three';
import { loadImage } from './utils';


const PLANE_SEGMENT_SCALE_DOWN_FACTOR = 25;


export default class SceneCard {
  group = new THREE.Group();

  private geometry: THREE.PlaneGeometry;
  private bgMaterial: THREE.MeshBasicMaterial;
  private bgTexture: THREE.Texture;
  private bgMesh: THREE.Mesh;
  private faceOverlayMaterial: THREE.MeshBasicMaterial;
  private faceOverlayTexture: THREE.Texture;
  private faceOverlayMesh: THREE.Mesh;


  constructor(private bgImagePath: string, private faceOverlayImagePath: string) {
    // TODO
  }


  async init() {
    const [ bgImage, faceOverlayImage ] = await Promise.all([
      loadImage(this.bgImagePath),
      loadImage(this.faceOverlayImagePath)
    ]);

    this.bgTexture = new THREE.Texture(bgImage);
    this.bgTexture.needsUpdate = true;
    this.faceOverlayTexture = new THREE.Texture(faceOverlayImage);
    this.faceOverlayTexture.needsUpdate = true;

    const { width, height } = bgImage;
    this.geometry = new THREE.PlaneGeometry(
      1,
      height / width,
      width / PLANE_SEGMENT_SCALE_DOWN_FACTOR,
      height / PLANE_SEGMENT_SCALE_DOWN_FACTOR
    );

    this.bgMaterial = new THREE.MeshBasicMaterial({ map: this.bgTexture, transparent: true });
    this.faceOverlayMaterial = new THREE.MeshBasicMaterial({ map: this.faceOverlayTexture, transparent: true, opacity: 0 });
    this.bgMesh = new THREE.Mesh(this.geometry, this.bgMaterial);
    this.faceOverlayMesh = new THREE.Mesh(this.geometry, this.faceOverlayMaterial);

    this.group.add(this.bgMesh, this.faceOverlayMesh);
  }


  dispose() {
    // TODO
  }
}
