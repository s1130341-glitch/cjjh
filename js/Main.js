import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';

// --- 1. 基本初始化 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 天藍色天空
scene.fog = new THREE.Fog(0x87ceeb, 20, 150); // 加入霧氣，增加城市深邃感

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- 2. 建立遊戲物件 ---
// 初始化隨機城市
const world = new World(scene);

// 初始化玩家 (包含模型與相機控制)
const player = new Player(scene, camera);

// --- 3. 燈光設定 ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // 基礎亮度
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.0); // 模擬太陽
sunLight.position.set(50, 100, 50);
sunLight.castShadow = true; // 如果之後想開陰影的話
scene.add(sunLight);

// --- 4. UI 互動邏輯 ---
const startButton = document.getElementById('start-button');
const instructions = document.getElementById('instructions');
const scoreElement = document.getElementById('score');

// 點擊開始按鈕，鎖定滑鼠視角
startButton.addEventListener('click', () => {
    player.controls.lock();
});

// 當滑鼠被鎖定 (進入遊戲)
player.controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
});

// 當按下 ESC 退出鎖定 (暫停遊戲)
player.controls.addEventListener('unlock', () => {
    instructions.style.display = 'block';
});

// --- 5. 射擊監聽 (滑鼠點擊) ---
window.addEventListener('mousedown', (event) => {
    if (player.controls.isLocked) {
        // 這裡預留給射擊邏輯
        console.log("射擊！");
        // player.shoot(); // 之後我們會在 Player 類別裡寫這個方法
    }
});

// --- 6. 遊戲主迴圈 (Game Loop) ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    // 獲取兩幀之間的時間差 (Delta Time)
    const delta = clock.getDelta();

    // 更新玩家移動與視角切換
    player.update(delta);

    // 可以在這裡呼叫 world.update(delta) 來讓 NPC 或車子移動
    
    // 執行渲染
    renderer.render(scene, camera);
}

// --- 7. 視窗縮放處理 ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 啟動動畫
animate();
