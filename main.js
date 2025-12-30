import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- 1. 基本場景與渲染器 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 天藍色
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. 燈光 ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(10, 20, 10);
scene.add(sunLight);

// --- 3. 地面與環境 (簡陋資源生成) ---
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// 隨機生成 50 個長方體建築
for (let i = 0; i < 50; i++) {
    const h = Math.random() * 20 + 5;
    const building = new THREE.Mesh(
        new THREE.BoxGeometry(5, h, 5),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    building.position.set(Math.random() * 200 - 100, h / 2, Math.random() * 200 - 100);
    scene.add(building);
}

// --- 4. 玩家模型 (圓柱體 + 圓球) ---
const playerGroup = new THREE.Group();
scene.add(playerGroup);

// 身體 (Cylinder)
const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x3498db })
);
body.position.y = 0.6; // 腳踩地
playerGroup.add(body);

// 頭部 (Sphere)
const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.35),
    new THREE.MeshStandardMaterial({ color: 0xf1c40f })
);
head.position.y = 1.5;
playerGroup.add(head);

// --- 5. 控制與縮放變數 ---
const controls = new PointerLockControls(camera, document.body);
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => instructions.style.display = 'none');
controls.addEventListener('unlock', () => instructions.style.display = 'block');

let cameraDistance = 0; // 0 = 第一人稱, > 0 = 第三人稱
const minDistance = 0;
const maxDistance = 8;

// 監聽滾輪縮放
window.addEventListener('wheel', (event) => {
    cameraDistance += event.deltaY * 0.005;
    cameraDistance = Math.min(maxDistance, Math.max(minDistance, cameraDistance));
}, { passive: true });

// 鍵盤移動邏輯
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyW') moveForward = true;
    if (e.code === 'KeyS') moveBackward = true;
    if (e.code === 'KeyA') moveLeft = true;
    if (e.code === 'KeyD') moveRight = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyW') moveForward = false;
    if (e.code === 'KeyS') moveBackward = false;
    if (e.code === 'KeyA') moveLeft = false;
    if (e.code === 'KeyD') moveRight = false;
});

// --- 6. 動畫迴圈 ---
const clock = new THREE.Clock();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls.isLocked) {
        // 移動計算
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        // 取得相機的水平方向（不考慮仰角，避免移動時飛天或鑽地）
        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const camSide = new THREE.Vector3().crossVectors(camera.up, camDir).normalize();

        if (moveForward || moveBackward) playerGroup.position.addScaledVector(camDir, direction.z * 15 * delta);
        if (moveLeft || moveRight) playerGroup.position.addScaledVector(camSide, direction.x * 15 * delta);

        // 玩家模型旋轉：讓模型永遠朝向相機看的水平方向
        playerGroup.rotation.y = Math.atan2(camDir.x, camDir.z);

        // --- 視角與縮放切換 ---
        if (cameraDistance < 0.5) {
            // 第一人稱：相機放在頭部，模型隱藏
            camera.position.copy(playerGroup.position);
            camera.position.y += 1.5; // 眼睛高度
            playerGroup.visible = false;
        } else {
            // 第三人稱：計算相機背後偏移量，模型顯示
            playerGroup.visible = true;
            
            // 計算相機相對於玩家的後退向量
            const backward = new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
            const offset = backward.multiplyScalar(cameraDistance);
            
            camera.position.copy(playerGroup.position).add(offset);
            camera.position.y += 1.8; // 稍微抬高一點視野
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
