import * as THREE from 'three';
import { World } from './World.js';
import { Player } from './Player.js';

// --- 1. 場景基礎設定 ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 天藍色
scene.fog = new THREE.Fog(0x87ceeb, 20, 200); // 加入霧氣增加城市深度感

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- 2. 核心物件初始化 ---
const world = new World(scene);
const player = new Player(scene, camera);

// --- 3. 燈光系統 ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(50, 100, 50);
scene.add(sunLight);

// --- 4. 分數與 UI 邏輯 ---
let score = 0;
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const instructions = document.getElementById('instructions');

// 點擊開始
startButton.addEventListener('click', () => {
    player.controls.lock();
});

player.controls.addEventListener('lock', () => {
    instructions.style.display = 'none';
});

player.controls.addEventListener('unlock', () => {
    instructions.style.display = 'block';
});

// --- 5. 射擊機制 ---
window.addEventListener('mousedown', () => {
    if (player.controls.isLocked) {
        // 呼叫 Player 的射擊方法，並傳入世界中的實體進行碰撞檢測
        const hit = player.shoot(world.entities); 
        if (hit) {
            score++;
            scoreElement.innerText = score;
        }
    }
});

// --- 6. 遊戲主迴圈 ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // 更新玩家移動與視角
    player.update(delta);

    // 更新世界（讓車輛與行人移動）
    world.update();

    renderer.render(scene, camera);
}

// 處理視窗縮放
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
