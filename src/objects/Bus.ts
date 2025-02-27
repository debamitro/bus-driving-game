import { 
    Mesh, 
    MeshPhongMaterial, 
    BoxGeometry, 
    Scene,
    Vector3
} from 'three';

export class Bus {
    position: Vector3;
    mesh: Mesh;
    
    constructor(scene: Scene) {
        const geometry = new BoxGeometry(1, 0.5, 2);
        const material = new MeshPhongMaterial({ color: 0xff0000 });
        this.mesh = new Mesh(geometry, material);
        this.mesh.position.y = 0.5;
        scene.add(this.mesh);
        this.position = this.mesh.position;
    }

    turnLeft() {
        this.mesh.rotation.y += 0.03;
    }

    turnRight() {
        this.mesh.rotation.y -= 0.03;
    }

    move (speed: number) {
        this.mesh.position.x += Math.sin(this.mesh.rotation.y) * speed;
        this.mesh.position.z -= Math.cos(this.mesh.rotation.y) * speed;
        this.position = this.mesh.position;   
    }
}