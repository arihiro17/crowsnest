import * as THREE from 'three';
import {BOID_SPEED, BOID_FOV, AREA_RANGE} from './Define';
import GLTFLoader from 'three-gltf-loader';
import SceneManager from './SceneManager';
import AgentAbstruct from './AgentAbstruct';
import BirdAgent from './BirdAgent';


export class VirtualBoid extends AgentAbstruct {
  constructor(pos = new THREE.Vector3(0, 0, 0)) {
    super(pos);
  }
}

// 群全体を管理するシングルトンクラス
class BirdManager {

  constructor() {
    this.agentList = [];

    this.UP = new THREE.Plane(new THREE.Vector3(0, -1, 0), AREA_RANGE.MAX_Y);
    this.DOWN = new THREE.Plane(new THREE.Vector3(0, 1, 0), AREA_RANGE.MIN_Y);
    this.LEFT = new THREE.Plane(new THREE.Vector3(1, 0, 0), AREA_RANGE.MIN_X);
    this.RIGHT = new THREE.Plane(new THREE.Vector3(-1, 0, 0), AREA_RANGE.MAX_X);
    this.FORWARD = new THREE.Plane(new THREE.Vector3(0, 0, -1), AREA_RANGE.MAX_Z);
    this.BACK = new THREE.Plane(new THREE.Vector3(0, 0, 1), AREA_RANGE.MIN_Z);
  }

  init() {
    setInterval(() => {
      // FPS60以上ならエージェント追加
      if (SceneManager.status.fps >= 60) {
        this.addAgent()
      }
    }, 1000);
  }

  // 更新
  update(dt) {
    // for( let agent of this.agentList ) {
    //   agent.update(dt);
    // }
  }

  // Agentを追加
  addAgent() {
    let bird = new BirdAgent();
    bird.setup();
    this.agentList.push( bird );
  }

  getCount() {
    return this.agentList.length;
  }

  getVirtualBoidsOnWall(obj) {
    let boids = [];
    var d;
    d = this.UP.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push( new VirtualBoid( obj.position.clone().sub( this.UP.clone().normal.multiplyScalar( d ) ) ) );
    }
    d = this.DOWN.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push( new VirtualBoid( obj.position.clone().sub( this.DOWN.clone().normal.multiplyScalar( d ) ) ) );
    }
    d = this.LEFT.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push( new VirtualBoid( obj.position.clone().sub( this.LEFT.clone().normal.multiplyScalar( d ) ) ) );
    }
    d = this.RIGHT.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push(new VirtualBoid( obj.position.clone().sub( this.RIGHT.clone().normal.multiplyScalar( d ) ) ) );
    }
    d = this.FORWARD.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push(new VirtualBoid( obj.position.clone().sub( this.FORWARD.clone().normal.multiplyScalar( d ) ) ) );
    }
    d = this.BACK.distanceToPoint(obj.position);
    if (d <= BOID_FOV) {
      boids.push(new VirtualBoid( obj.position.clone().sub( this.BACK.clone().normal.multiplyScalar( d ) ) ) );
    }

    return boids;
  }

  getOtherBoidsPosInFOV(obj) {
    let boids = [];
    this.agentList.forEach((boid) => {

      if (boid === obj) return;

      let diff = boid.position.clone().sub(obj.position);
      if (diff.length() <= BOID_FOV) {
        // boids.add(boid);
        boids.push(new VirtualBoid(boid.position));
      }
    });

    return boids;
  }

  getOtherBoidsVelocityInFOV(obj) {
    let boids = [];
    this.agentList.forEach((boid) => {

      if (boid === obj) return;

      let diff = boid.position.clone().sub(obj.position);
      if (diff.length() <= BOID_FOV) {
        boids.push(boid);
      }
    });

    return boids;
  }
}

export const birdManager = new BirdManager();
