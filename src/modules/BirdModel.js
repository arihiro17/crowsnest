import * as THREE from 'three';
import 'GLTFLoader';
import 'DRACOLoader';
import _ from 'lodash/Object'

export default class BirdModel {
  constructor() {
    this.model = new THREE.Object3D();
    this.anim = null;
    THREE.DRACOLoader.setDecoderPath('libs/draco/gltf/');
  }
  load() {
    return new Promise(
      (resolve, reject) => {
        let loader = new THREE.GLTFLoader();
        loader.setDRACOLoader( new THREE.DRACOLoader() );
        loader.load(
          './model/bird2anim.glb',
          ( gltf ) => {
            // console.log(gltf);
            this.model = gltf.scene;
            // this.model.traverse((node) => {
            //   if ( node.isMesh || node.isLight ) node.castShadow = true;
            // });
            this.clips = gltf.animations;
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
    return this.model;
  }
  getAnimation(index = 0) {
    return this.clips[index];
  }
}

// export default new BirdModel;
