import * as THREE from 'three';

export class LaneDivider {
    segments: THREE.Mesh[] = [];
    spacing = 5; // Space between dashed lines
    lineLength = 3; // Length of each line segment
    
    constructor(scene: THREE.Scene, position: THREE.Vector3, length: number = 50) {
        const numSegments = Math.floor(length / (this.spacing + this.lineLength));
        
        for (let i = 0; i < numSegments; i++) {
            const geometry = new THREE.PlaneGeometry(0.2, this.lineLength);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xffffff,
                roughness: 0.5,
                metalness: 0.2
            });
            
            const segment = new THREE.Mesh(geometry, material);
            segment.rotation.x = -Math.PI / 2;
            
            // Position each segment with spacing
            const zOffset = i * (this.spacing + this.lineLength);
            segment.position.copy(position).add(new THREE.Vector3(0, 0.01, zOffset));
            
            scene.add(segment);
            this.segments.push(segment);
        }
    }

    update(carPosition: THREE.Vector3) {
        this.segments.forEach(segment => {
            // If the car has passed this segment, move it ahead
            if (carPosition.z - segment.position.z > 25) {
                segment.position.z += 150; // Move 3 segments ahead
            }
            // If the car has moved backwards past this segment
            if (carPosition.z - segment.position.z < -125) {
                segment.position.z -= 150; // Move 3 segments back
            }
        });
    }
}
