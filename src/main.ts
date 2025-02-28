import * as THREE from 'three';
import { Bus } from './objects/Bus';
import { Explosion } from './classes/Explosion';
import { RoadSegment } from './objects/RoadSegment';
import { Barrier } from './objects/Barrier';
import { LaneDivider } from './objects/LaneDivider';
import { Sun } from './objects/Sun';
import { Cow } from './objects/Cow';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02CCFE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const horizon = new THREE.CylinderGeometry(1000, 1000, 100, 32);
const horizonMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
const horizonMesh = new THREE.Mesh(horizon, horizonMaterial);
horizonMesh.position.set(0, -100, 0);
scene.add(horizonMesh);

const bus = new Bus(scene);

// Create road segments
const roadSegments: RoadSegment[] = [];
for (let i = 0; i < 4; i++) {
    roadSegments.push(new RoadSegment(scene, new THREE.Vector3(0, 0, i * 50 - 75)));
}

// Add lane dividers
const leftDivider = new LaneDivider(scene, new THREE.Vector3(-1.67, 0, -75));
const rightDivider = new LaneDivider(scene, new THREE.Vector3(1.67, 0, -75));

const cow = new Cow(scene, new THREE.Vector3(-5, 0.3, -10));

// Add barriers
const barrierLeft = new Barrier(scene, -5.25);
const barrierRight = new Barrier(scene, 5.25);

const sun = new Sun(scene);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera position
camera.position.set(0, 3, 5);
camera.lookAt(bus.position);

// Game state
let speed = 0;
const maxSpeed = 0.3;
const acceleration = 0.01;
const deceleration = 0.005;
const cowSpeed = { x: 0.08, z: 0.15 };

// Controls
const keys: { [key: string]: boolean } = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Create explosion system
const explosion = new Explosion(scene);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update road segments
    roadSegments.forEach(segment => segment.update(bus.position));
    horizonMesh.position.z = bus.position.z;

    // Update lane dividers
    leftDivider.update(bus.position);
    rightDivider.update(bus.position);

    // Update barriers
    barrierLeft.update(bus.position);
    barrierRight.update(bus.position);

    // Keep sun fixed relative to camera
    sun.update(camera.position);

    cow.update(cowSpeed);

    if (cow.position.x <= -5 || cow.position.x >= 5) {
        cow.reset(bus.position);
    }

    if (cow.position.z - bus.position.z < -40) {
        cow.reset(bus.position);
    }

    // Update explosion particles
    explosion.update();

    // Car controls
    if (keys['ArrowUp']) {
        speed = Math.min(speed + acceleration, maxSpeed);
    } else if (keys['ArrowDown']) {
        speed = Math.max(speed - acceleration, -maxSpeed);
    } else {
        speed = Math.abs(speed) < deceleration ? 0 : speed - Math.sign(speed) * deceleration;
    }

    if (keys['ArrowLeft']) {
        bus.turnLeft();
    }

    if (keys['ArrowRight']) {
        bus.turnRight()
    }

    bus.move (speed);

    // Update camera position
    camera.position.x = bus.position.x;
    camera.position.z = bus.position.z + 5;
    camera.lookAt(bus.position);

    renderer.render(scene, camera);
}

animate();
