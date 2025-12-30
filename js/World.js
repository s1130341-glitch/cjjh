import * as THREE from 'three';
import { Entity } from './Entity.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.buildings = [];
        this.entities = []; // 存儲車輛與路人
        this.gridSize = 200; 
        this.cellSize = 20;  // 網格大小
        
        this.generate();
    }

    generate() {
        // 1. 生成地面與建築
        for (let x = -this.gridSize / 2; x < this.gridSize / 2; x += this.cellSize) {
            for (let z = -this.gridSize / 2; z < this.gridSize / 2; z += this.cellSize) {
                
                // 判斷是否為道路 (簡單規律：每隔兩格一條路)
                const isRoadX = Math.abs(x) % (this.cellSize * 3) === 0;
                const isRoadZ = Math.abs(z) % (this.cellSize * 3) === 0;

                if (isRoadX || isRoadZ) {
                    this.createRoad(x, z);
                    
                    // 在道路上隨機生成車輛或行人
                    if (Math.random() > 0.9) {
                        const type = Math.random() > 0.5 ? 'car' : 'npc';
                        this.entities.push(new Entity(this.scene, type, x, z));
                    }
                } else {
                    // 非道路區域生成建築
                    if (Math.random() > 0.2) {
                        this.createBuilding(x, z);
                    }
                }
            }
        }
    }

    createBuilding(x, z) {
        const w = Math.random() * 8 + 5;
        const h = Math.random() * 40 + 10; // 隨機高度
        const d = Math.random() * 8 + 5;
        
        const geometry = new THREE.BoxGeometry(w, h, d);
        const colorVal = 0.3 + Math.random() * 0.3;
        const material = new THREE.MeshPhongMaterial({ 
            color: new THREE.Color(colorVal, colorVal, colorVal + 0.1) 
        });
        
        const building = new THREE.Mesh(geometry, material);
        // 隨機微調位置讓城市不那麼死板
        building.position.set(x + (Math.random()-0.5)*5, h / 2, z + (Math.random()-0.5)*5);
        
        this.scene.add(building);
        this.buildings.push(building);
    }

    createRoad(x, z) {
        const geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize);
        const material = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const road = new THREE.Mesh(geometry, material);
        road.rotation.x = -Math.PI / 2;
        road.position.set(x, 0.05, z);
        this.scene.add(road);
    }

    update() {
        // 更新所有移動實體的位置
        this.entities.forEach(entity => {
            entity.update();
        });
    }
}
