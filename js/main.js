import * as THREE from 'three';

// 1. 基本場景設定
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 天藍色背景

// 2. 相機設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// 3. 渲染器設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. 建立地板 (用程式碼生成)
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x228b22 }); // 森林綠
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // 讓地板水平
scene.add(floor);

// 5. 加入燈光
const light = new THREE.AmbientLight(0xffffff, 0.5); // 環境光
scene.add(light);
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(5, 10, 7.5);
scene.add(sunLight);

// 6. 渲染迴圈
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// 監聽視窗縮放
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
