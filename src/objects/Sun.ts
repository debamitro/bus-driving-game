import {
    Scene,
    Mesh,
    CircleGeometry,
    MeshBasicMaterial,
    CanvasTexture,
    DoubleSide,
    Vector3
} from 'three';

export class Sun {
    mesh: Mesh;
    glow: Mesh;

    constructor (scene: Scene) {
        const geometry = new CircleGeometry(20, 32);
        const material = new MeshBasicMaterial({ 
            color: 0xFFFF00,
            side: DoubleSide
        });
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.set(200, 50, -500);
        scene.add(this.mesh);

        // Create sun glow
        const glowGeometry = new CircleGeometry(25, 32); // Slightly larger than the sun
        const glowTexture = new CanvasTexture((() => {
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
        const glowMaterial = new MeshBasicMaterial({
            map: glowTexture,
            transparent: true,
            side: DoubleSide
        });
        this.glow = new Mesh(glowGeometry, glowMaterial);
        this.glow.position.copy(this.mesh.position);
        scene.add(this.glow);
    }

    update (position: Vector3) {
        this.mesh.position.x = position.x + 200;
        this.mesh.position.z = position.z - 500;
        this.mesh.position.y = 50;
        this.glow.position.copy(this.mesh.position);    
    }
}