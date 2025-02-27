import * as THREE from 'three';
import { Bus } from './objects/Bus';
import { Explosion } from './classes/Explosion';
import { RoadSegment } from './objects/RoadSegment';
import { Barrier } from './objects/Barrier';
import { LaneDivider } from './objects/LaneDivider';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02CCFE);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const horizon = new THREE.CylinderGeometry(400, 400, 100, 32);
const horizonMaterial = new THREE.MeshPhongMaterial({ color: 0x900C3F });
const horizonMesh = new THREE.Mesh(horizon, horizonMaterial);
horizonMesh.position.set(0, 0, -100);
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

// Ball
const ballGeometry = new THREE.SphereGeometry(0.3);
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(-5, 0.3, -10);
scene.add(ball);

// Add barriers
const barrierLeft = new Barrier(scene, -5.25);
const barrierRight = new Barrier(scene, 5.25);

// Update ball reset position to be relative to car
const resetBall = () => {
    ball.position.set(
        -5, 
        0.3, 
        bus.position.z - 20 + Math.random() * 10
    );
};

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

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
const ballSpeed = { x: 0.2, z: 0.15 };

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

    // Update lane dividers
    leftDivider.update(bus.position);
    rightDivider.update(bus.position);

    // Update barriers
    barrierLeft.update(bus.position);
    barrierRight.update(bus.position);

    // Ball movement
    ball.position.x += ballSpeed.x;
    ball.position.z += ballSpeed.z;
    ball.rotation.x -= ballSpeed.z * 2;
    ball.rotation.z += ballSpeed.x * 2;

    // Check for collision
    const distance = bus.position.distanceTo(ball.position);
    if (distance < 1) {
        explosion.trigger(ball.position.clone());
        resetBall();
    }

    // Reset ball position when it goes too far or reaches the other side
    if (ball.position.z > bus.position.z + 10 || ball.position.x > 5) {
        resetBall();
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
