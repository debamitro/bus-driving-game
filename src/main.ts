import * as THREE from 'three';
import { Explosion } from './classes/Explosion';
import { RoadSegment } from './classes/RoadSegment';
import { Barrier } from './classes/Barrier';
import { LaneDivider } from './classes/LaneDivider';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// Car
const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
const carMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.y = 0.5;
scene.add(car);

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
        car.position.z - 20 + Math.random() * 10
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
camera.lookAt(car.position);

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
    roadSegments.forEach(segment => segment.update(car.position));

    // Update lane dividers
    leftDivider.update(car.position);
    rightDivider.update(car.position);

    // Update barriers
    barrierLeft.update(car.position);
    barrierRight.update(car.position);

    // Ball movement
    ball.position.x += ballSpeed.x;
    ball.position.z += ballSpeed.z;
    ball.rotation.x -= ballSpeed.z * 2;
    ball.rotation.z += ballSpeed.x * 2;

    // Check for collision
    const distance = car.position.distanceTo(ball.position);
    if (distance < 1) {
        explosion.trigger(ball.position.clone());
        resetBall();
    }

    // Reset ball position when it goes too far or reaches the other side
    if (ball.position.z > car.position.z + 10 || ball.position.x > 5) {
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
        car.rotation.y += 0.03;
    }
    if (keys['ArrowRight']) {
        car.rotation.y -= 0.03;
    }

    // Update car position
    car.position.x += Math.sin(car.rotation.y) * speed;
    car.position.z += Math.cos(car.rotation.y) * speed;

    // Update camera position
    camera.position.x = car.position.x;
    camera.position.z = car.position.z + 5;
    camera.lookAt(car.position);

    renderer.render(scene, camera);
}

animate();
