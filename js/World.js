import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.roads = [];
        this.gridSize = 100; // 城市大小
        this.cellSize = 10;  // 每一格的大小
        
        this.generate();
    }

    generate() {
        // 遍歷網格
        for (let x = -this.gridSize; x < this.gridSize; x += this.cellSize) {
            for (let z = -this.gridSize; z < this.gridSize; z += this.cellSize) {
                
                // 隨機決定這一格是 道路 還是 建築
                // 假設 20% 的機率是道路 (x 或 z 是 10 的倍數時)
                if (Math.abs(x) % 30 === 0 || Math.abs(z) % 30 === 0) {
                    this.createRoad(x, z);
                } else {
                    // 70% 機率生成建築，留下一點空隙
                    if (Math.random() > 0.3) {
                        this.createBuilding(x, z);
                    }
                }
            }
        }
    }

    createBuilding(x, z) {
        const w = Math.random() * 5 + 3; // 寬度 3~8
        const h = Math.random() * 20 + 5; // 高度 5~25
        const d = Math.random() * 5 + 3; // 深度 3~8
        
        const geometry = new THREE.BoxGeometry(w, h, d);
        // 隨機灰色調（像都市建築）
        const colorValue = Math.random() * 0.5 + 0.3;
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(colorValue, colorValue, colorValue + 0.1) 
        });
        
        const building = new THREE.Mesh(geometry, material);
        // 設定位置，y 軸要加上高度的一半，確保建築底部在地板上
        building.position.set(x + (Math.random() - 0.5) * 2, h / 2, z + (Math.random() - 0.5) * 2);
        
        this.scene.add(building);
        this.buildings.push(building);
    }

    createRoad(x, z) {
        const geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize);
        const material = new THREE.MeshPhongMaterial({ color: 0x333333 }); // 深灰色道路
        const road = new THREE.Mesh(geometry, material);
        
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.01, z); // 稍微高於地板 0.01 避免閃爍 (Z-fighting)
        
        this.scene.add(road);
        this.roads.push(road);
    }
}
