import * as THREE from 'three';
// import GLTFLoader from 'three-gltf-loader';
// import WEBVR from './modules/WebVR';
import WebVRPolyfill from 'webvr-polyfill';
import Stats from 'stats-js';

import SceneManager from './modules/SceneManager';
import BirdModel from './modules/BirdModel';
import {birdManager} from './modules/BirdManager';
import Skybox from './modules/Skybox';
import GuiControll from './modules/GuiControll'

let polyfill;

document.addEventListener("DOMContentLoaded", function() {
  polyfill = new WebVRPolyfill();

  SceneManager.init();
  BirdModel.load().then( () =>{
    let skybox = new Skybox([
      "img/skybox/Left_Tex.png",
      "img/skybox/Right_Tex.png",
      "img/skybox/Up_Tex.png",
      "img/skybox/Down_Tex.png",
      "img/skybox/Front_Tex.png",
      "img/skybox/Back_Tex.png"
    ]);
    skybox.show();
    birdManager.init();
  } );
});
