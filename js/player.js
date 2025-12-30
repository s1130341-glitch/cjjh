import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // 1. 建立玩家模型 (用長方體拼湊)
        this.mesh = new THREE.Group();
        
        // 身體
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 1, 0.4),
            new THREE.MeshPhongMaterial({ color: 0x00ff00 })
        );
        body.position.y = 1; 
        this.mesh.add(body);
        
        // 頭部
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.4, 0.4),
            new THREE.MeshPhongMaterial({ color: 0xffccaa })
        );
        head.position.y = 1.7;
        this.mesh.add(head);

        this.scene.add(this.mesh);

        // 2. 控制設定
        this.controls = new PointerLockControls(this.camera, document.body);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // 3. 初始相機距離 (第三人稱)
        this.cameraDistance = 5; 
        this.setupControls();
    }

    setupControls() {
        const onKeyDown = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
            }
        };
        const onKeyUp = (event) => {
            switch (event.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
            }
        };
        // 滾輪控制相機距離
        const onWheel = (event) => {
            this.cameraDistance += event.deltaY * 0.01;
            this.cameraDistance = Math.max(0, Math.min(10, this.cameraDistance)); // 限制距離在 0~10 之間
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        document.addEventListener('wheel', onWheel);
    }

    update(delta) {
        if (!this.controls.isLocked) return;

        // 處理移動邏輯
        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 100.0 * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 100.0 * delta;

        this.controls.moveRight(-this.velocity.x * delta);
        this.controls.moveForward(-this.velocity.z * delta);

        // 讓玩家模型跟隨相機位置，但維持在地板上
        this.mesh.position.copy(this.camera.position);
        this.mesh.position.y = 0; // 腳踩地板
        this.mesh.rotation.y = this.camera.rotation.y; // 模型轉向與相機一致

        // --- 第一人稱 / 第三人稱 切換邏輯 ---
        // 根據 cameraDistance 設定相機相對於玩家的位置
        const relativeCameraOffset = new THREE.Vector3(0, 1.7, this.cameraDistance);
        const cameraOffset = relativeCameraOffset.applyQuaternion(this.camera.quaternion);
        
        // 如果距離接近 0，隱藏模型 (第一人稱)
        if (this.cameraDistance < 0.5) {
            this.mesh.visible = false;
        } else {
            this.mesh.visible = true;
            // 讓相機後退，形成第三人稱視角
            this.camera.position.sub(cameraOffset.multiplyScalar(0.1)); 
        }
    }
}
