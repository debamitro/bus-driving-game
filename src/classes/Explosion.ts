import * as THREE from 'three';

export class Explosion {
    particles: THREE.Points;
    velocities: THREE.Vector3[];
    isActive: boolean;

    constructor(scene: THREE.Scene) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        this.velocities = [];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            this.velocities.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.3,
                Math.random() * 0.2,
                (Math.random() - 0.5) * 0.3
            ));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
            color: 0xff5500,
            size: 0.2,
        });

        this.particles = new THREE.Points(geometry, material);
        this.isActive = false;
        scene.add(this.particles);
    }

    trigger(position: THREE.Vector3) {
        this.isActive = true;
        const positions = this.particles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = position.x;
            positions[i + 1] = position.y;
            positions[i + 2] = position.z;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }

    update() {
        if (!this.isActive) return;

        const positions = this.particles.geometry.attributes.position.array as Float32Array;
        let allParticlesSettled = true;

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += this.velocities[i / 3].x;
            positions[i + 1] += this.velocities[i / 3].y;
            positions[i + 2] += this.velocities[i / 3].z;

            // Apply gravity
            this.velocities[i / 3].y -= 0.01;

            // Check if particle is still moving significantly
            if (Math.abs(this.velocities[i / 3].y) > 0.01) {
                allParticlesSettled = false;
            }
        }

        if (allParticlesSettled) {
            this.isActive = false;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
