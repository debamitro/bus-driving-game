import { Scene, Vector3, Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class Cow {
    thing: Group;
    position: Vector3;
    loaded: Boolean = false;

    constructor(scene: Scene, initialPosition: Vector3) {
        const loader = new GLTFLoader();
        this.position = initialPosition;
        loader.load('models/Cow.gltf',
            (gltf) => {
                this.thing = gltf.scene;
                this.thing.rotation.y = Math.PI / 2;
                this.thing.scale.set(0.2, 0.2, 0.2); // Scale down the model
                this.thing.position.set(this.position.x,
                    this.position.y,
                    this.position.z);
                scene.add(gltf.scene);      
                this.loaded = true;
            },
            (xhr) => {

            },
            (error) => {
            
            }
        );
    }

    update(speed: { x: number, z: number }) {
        if (!this.loaded) {
            return;
        }

        this.thing.position.x += speed.x;
        this.position = this.thing.position;
    }

    reset(busPosition: Vector3) {
        if (!this.loaded) {
            return;
        }

        this.thing.position.set(
            -5,
            0.3,
            busPosition.z - 20 + Math.random() * 10
        );
        this.position = this.thing.position;
    }
}
