import * as THREE from 'three';

export class RoadSegment {
    mesh: THREE.Mesh;
    
    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        const geometry = new THREE.PlaneGeometry(10, 50);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(position);
        scene.add(this.mesh);
    }

    update(busPosition: THREE.Vector3) {
        // If the bus has passed this segment, move it ahead
        if (busPosition.z - this.mesh.position.z > 25) {
            this.mesh.position.z += 150; // Move 3 segments ahead (3 * 50)
        }
        // If the bus has moved backwards past this segment
        if (busPosition.z - this.mesh.position.z < -75) {
            this.mesh.position.z -= 150; // Move 3 segments back
        }
    }
}
