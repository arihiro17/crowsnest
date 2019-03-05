import * as THREE from 'three';
import 'GLTFLoader';

class BirdModel {
  constructor() {
    this.model = new THREE.Object3D();
    this.anim = null
  }
  load() {
    return new Promise(
      (resolve, reject) => {
        let loader = new THREE.GLTFLoader();
        loader.load(
          'model/_bird.glb',
          ( data ) => {
            let gltf = data;
            this.model = gltf.scene;
            this.anim = gltf.animations;
            resolve();
          },
          ( xhr ) => {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded.' ) ;
          },
          ( err ) => {
            console.log('An Error happened');
            reject( err );
          }
        );
      }
    )
  }
  getModel() {
    return this.model.clone();
  }
  getAnimation() {
    return this.anim;
  }
}

export default new BirdModel;
