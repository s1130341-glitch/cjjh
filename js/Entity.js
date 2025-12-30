import * as THREE from 'three';

export class Entity {
    constructor(scene, type, x, z) {
        this.scene = scene;
        this.type = type; // 'car' 或 'npc'
        this.mesh = new THREE.Group();
        this.speed = type === 'car' ? 0.2 + Math.random() * 0.3 : 0.05;
        this.direction = new THREE.Vector3(1, 0, 0); // 預設移動方向

        this.init(x, z);
    }

    init(x, z) {
        if (this.type === 'car') {
            // 建立方塊車
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2, 1, 1),
                new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
            );
            this.mesh.add(body);
            // 簡單的小輪子
            const wheelGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
            const wheelMat = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const w1 = new THREE.Mesh(wheelGeo, wheelMat); w1.position.set(0.6, -0.4, 0.5);
            const w2 = new THREE.Mesh(wheelGeo, wheelMat); w2.position.set(-0.6, -0.4, 0.5);
            this.mesh.add(w1, w2);
        } else {
            // 建立路人
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.8, 0.3),
                new THREE.MeshPhongMaterial({ color: 0xff0000 })
            );
            this.mesh.add(body);
        }
        this.mesh.position.set(x, 1, z);
        this.scene.add(this.mesh);
    }

    update() {
        // 沿著方向移動
        this.mesh.position.addScaledVector(this.direction, this.speed);
        
        // 簡單的範圍重置 (超出 100 就回到另一頭)
        if (Math.abs(this.mesh.position.x) > 100) this.mesh.position.x *= -1;
        if (Math.abs(this.mesh.position.z) > 100) this.mesh.position.z *= -1;
    }
}
