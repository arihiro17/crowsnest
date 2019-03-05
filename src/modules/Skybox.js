import * as THREE from 'three';
import SceneManager from './SceneManager';


class Skybox {
  constructor(urls) {

    let texCube = new THREE.CubeTextureLoader().load(urls);
    texCube.format = THREE.RGBFormat;
    texCube.mapping = THREE.CubeReflectionMapping;

    // skybox用のマテリアルを生成
    let cubeShader = THREE.ShaderLib["cube"];
    let cubeMat = new THREE.ShaderMaterial({
      fragmentShader: cubeShader.fragmentShader,
      vertexShader: cubeShader.vertexShader,
      uniforms: cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide,
    });

    cubeMat.uniforms["tCube"].value = texCube;

    // Skybox用ジオメトリ生成
    let d = 10000;
    let cubeGeo = new THREE.BoxGeometry(d, d, d);
    this.cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  }

  show() {
    SceneManager.addScene(this.cubeMesh);
  }
}

export default Skybox;
