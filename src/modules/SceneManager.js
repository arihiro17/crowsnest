import * as THREE from 'three';
import EventEmitter from 'eventemitter3';
import WEBVR from './WebVR';
import 'datguivr';
import {birdManager} from './BirdManager';


// const VIEWPORT_W = 960;
// const VIEWPORT_H = 540;

// let viewport_w = window.innerWidth;
// let viewport_h = window.innerHeight;


class SceneManager extends EventEmitter {
  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
    // カメラ用のコンテナを作成
    this.cameraContainer = new THREE.Object3D();
    this.cameraContainer.add(this.camera);
    this.scene.add(this.cameraContainer);
    this.cameraContainer.position.y = 0;

    // this.helper = new THREE.AxesHelper(100);
    // this.scene.add(this.helper);

    // レンダラーを作成
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#canvas'),
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xeeeeee, 1.0);
    this.renderer.vr.enabled = true;
    const container = document.getElementById('container');
    container.style.position = "relative";
    container.style.width = '100%';
    container.style.height = '100%';

    document.body.appendChild(this.renderer.domElement);
    document.body.appendChild(WEBVR.createButton(this.renderer));
    this.renderer.setAnimationLoop( () => this.tick() );
    this.beginTime = ( performance || Date ).now();
    this.frames = 0;

    window.addEventListener('resize', () => this._onResize(), false);

    // 光源の作成
    {
      const light = new THREE.DirectionalLight(0xFFFFFF, 1);
      this.scene.add(light);
    }

    let Status = function() {
      this.num = 0;
      this.fps = 0;
    };

    this.status = new Status();

    dat.GUIVR.enableMouse( this.camera, this.renderer );
    // console.log(window);
    this.gui = dat.GUIVR.create('status');
    this.gui.position.set(0, 0, -2);
    this.gui.add(this.status, 'num').min(0).max(1000).listen();
    this.gui.add(this.status, 'fps').listen();

    // this.cameraContainer.add(this.gui);
    this.scene.add(this.gui);

  }

  tick() {
    this.frames++;
    let time = (performance || Date).now();
    if (time >= this.beginTime + 1000) {
      this.status.fps = (this.frames * 1000) / (time - this.beginTime);
      this.beginTime = time;
      this.frames = 0;
    }

    this.emit('update');
    this.status.num = birdManager.getCount();
    this.renderer.render(this.scene, this.camera);
  }

  addScene(obj) {
    this.scene.add(obj);
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
}

export default new SceneManager;
