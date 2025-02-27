import * as THREE from 'three';

export class Barrier {
    mesh: THREE.Mesh;

    constructor(scene: THREE.Scene, x: number) {
        const geometry = new THREE.BoxGeometry(0.5, 1, 50);
        const material = new THREE.MeshPhongMaterial({ color: 0x666666 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, 0.5, 0);
        scene.add(this.mesh);
    }

    update(carPosition: THREE.Vector3) {
        this.mesh.position.z = carPosition.z;
    }
}
