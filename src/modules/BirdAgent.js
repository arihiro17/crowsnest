import * as THREE from 'three';
import _ from 'lodash/Object'
import {BOID_SPEED, BOID_FOV, AREA_RANGE} from './Define';
import {randomRange, clamp} from './Util';
import SceneManager from './SceneManager';
import {birdManager, VirtualBoid} from './BirdManager';
import BirdModel from './BirdModel';
import AgentObject from './AgentAbstruct';

const RULE_SEPARATION_FACTOR = 9.0;
const RULE_ALIGNMENT_FACTOR = 0.5;
const RULE_COHESION_FACTOR = 0.5;

// 単一のAgent
export default class BirdAgent extends AgentObject {
  constructor() {
    // 位置をランダムで決める
    super(new THREE.Vector3( randomRange(AREA_RANGE.MIN_X, AREA_RANGE.MAX_X), randomRange(AREA_RANGE.MIN_Y, AREA_RANGE.MAX_Y), randomRange(AREA_RANGE.MIN_Z, AREA_RANGE.MAX_Z) ));

    this.model = null;
    this.mixer = null;
    this.clip = null;

    this.setupComplete = false;

    // 加速度
    this.acceleration = new THREE.Vector3(0, 0, 0);
    // 速度
    this.velocity = new THREE.Vector3( randomRange(BOID_SPEED.MIN_V, BOID_SPEED.MAX_V), randomRange(BOID_SPEED.MIN_V, BOID_SPEED.MAX_V), randomRange(BOID_SPEED.MIN_V, BOID_SPEED.MAX_V) ).clampLength(BOID_SPEED.MIN_V, BOID_SPEED.MAX_V);
    this.onUpdate = this.update();
  }

  setup() {
    // const birdModel = BirdModel.getModel();

    const birdloader = new BirdModel();
    birdloader.load().then(() => {
      const birdModel = birdloader.getModel();

      birdModel.rotation.set(0, Math.PI / 2, 0);
      birdModel.scale.set(0.08, 0.08, 0.08);
      this.model = new THREE.Object3D();
      this.model.add(birdModel);

      this.mixer = new THREE.AnimationMixer(birdModel);
      // let clip = BirdModel.getAnimation();
      let clip = birdloader.getAnimation();
      let action = this.mixer.clipAction(clip);

      action.play();

      if (this.mixer) {
        this.mixer.stopAllAction();
        this.mixer.uncacheRoot(this.mixer.getRoot());
        this.mixer = null;
      }

      if (clip) {
        if (clip.validate()) clip.optimize();

        this.clip = clip;

        this.mixer = new THREE.AnimationMixer(birdModel);
        this.mixer.clipAction(clip).play();
      }

      SceneManager.addScene(this.model);


      this._updatePosRot();
      this.clock = new THREE.Clock();

      // this.setupComplete = true;
      SceneManager.on('update', this.onUpdate);
    }, null);
  }

  // 更新
  update() {
    return () => {
      // let time = Date.now();
      // let dt = (time - this.time) / 1000;
      let dt = this.clock.getDelta();
      // this.time = time;

      // if (!this.setupComplete) return;

      let dPos = this.velocity.clone().multiplyScalar( dt ).add( this.acceleration.clone().multiplyScalar( dt * dt * 0.5 ) );
      this.velocity.add( this.acceleration.clone().multiplyScalar( dt ) );

      // // 速度BoidMinV以上BoidMaxV以下でなければならない
      this.velocity.clampLength(BOID_SPEED.MIN_V, BOID_SPEED.MAX_V);

      this.position.add( dPos );

      // // 加速度構成
      let accel = new THREE.Vector3( 0, 0, 0 );
      accel.add(this._ruleSeparation().multiplyScalar(RULE_SEPARATION_FACTOR));
      accel.add(this._ruleAlignment().multiplyScalar(RULE_ALIGNMENT_FACTOR));
      accel.add(this._ruleCohesion().multiplyScalar(RULE_COHESION_FACTOR));
      this.acceleration = accel.divideScalar(RULE_SEPARATION_FACTOR + RULE_ALIGNMENT_FACTOR + RULE_COHESION_FACTOR);

      this._updatePosRot();

      this.mixer && this.mixer.update(dt);
    }
  }

  _updatePosRot() {
    console.log(this.model);
    this.model.position.set(this.position.x, this.position.y, this.position.z);
    // this.model.lookAt( this.velocity.clone().normalize() );
    this.model.rotation.y = Math.atan2( - this.velocity.z, this.velocity.x );
    this.model.rotation.z = Math.asin( this.velocity.y / this.velocity.length() );
  }

  // Rule1:衝突の回避
  _ruleSeparation() {
    let virtualBoids = birdManager.getVirtualBoidsOnWall(this);
    let boidsInFOV = birdManager.getOtherBoidsPosInFOV(this);

    let objects = _.merge(virtualBoids, boidsInFOV);

    if (objects.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    let vec = new THREE.Vector3(0, 0, 0);
    objects.forEach((obj) => {
      let diff = obj.position.clone().sub(this.position);
      let scalar = 10.0 / ( diff.length() * diff.length() );
      vec.add(diff.normalize().negate().multiplyScalar( scalar ) );
    });

    let ret = vec.divideScalar(objects.length);
    // console.log('Rule1', ret);
    return ret;
  }

  // Rule2:速度の適合
  _ruleAlignment() {
    let boids = birdManager.getOtherBoidsVelocityInFOV(this);

    if (boids.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    let vec = new THREE.Vector3(0, 0, 0);
    boids.forEach((boid) => {
      vec.add(boid.velocity);
    });

    let avg = vec.divideScalar(boids.length);
    let ret = avg.sub(this.velocity);
    // console.log('Rule2:', ret);
    return ret;
  }

  // Rule3:群れ中心化
  _ruleCohesion() {
    let boids = birdManager.getOtherBoidsPosInFOV(this);

    // エリアの中心に向かうバイアスをかける
    boids.push( new VirtualBoid( new THREE.Vector3( (AREA_RANGE.MAX_X - AREA_RANGE.MIN_X) / 2, (AREA_RANGE.MAX_Y - AREA_RANGE.MIN_Y) / 2, (AREA_RANGE.MAX_Z - AREA_RANGE.MIN_Z) / 2 ) ) );

    if (boids.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }

    let pos = new THREE.Vector3(0, 0, 0);
    boids.forEach((boid) => {
      pos.add(boid.position);
    });

    let avg = pos.divideScalar(boids.length);
    let ret = avg.sub(this.position);
    // console.log('Rule3:', ret);
    return avg.sub(this.position);
  }

  getMesh(obj) {
    // console.log(obj);
      let refO = null;

      if(obj.type.toLowerCase().indexOf("skinnedmesh") > -1){
          return obj;
      }

      for(let i =0; i < obj.children.length; i++){
          refO = this.getMesh(obj.children[i]);
          if(refO) {break;}
      }
      return refO;
  }
}
