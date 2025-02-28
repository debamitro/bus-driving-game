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

// Create sun
const sunGeometry = new THREE.CircleGeometry(20, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFFFF00,
    side: THREE.DoubleSide
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(200, 50, -500); // Position high in the sky
scene.add(sun);

// Create sun glow
const glowGeometry = new THREE.CircleGeometry(25, 32); // Slightly larger than the sun
const glowTexture = new THREE.CanvasTexture((() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 80, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255, 255, 100, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return canvas;
})());
const glowMaterial = new THREE.MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    side: THREE.DoubleSide
});
const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sunGlow.position.copy(sun.position);
scene.add(sunGlow);

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

    // Keep sun fixed relative to camera
    sun.position.x = camera.position.x + 200;
    sun.position.z = camera.position.z - 500;
    sun.position.y = 50;
    sunGlow.position.copy(sun.position);

    // Ball movement
    ball.position.x += ballSpeed.x;

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
