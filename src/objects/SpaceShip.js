import * as THREE from 'three';

/**
 * Космический корабль - базовый класс для игровых объектов
 */
export class SpaceShip {
    constructor() {
        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.maxSpeed = 100;
        this.thrust = 50;
        
        this.init();
    }

    /**
     * Инициализация космического корабля
     */
    init() {
        this.createSpaceShip();
        console.log('🚀 Космический корабль создан');
    }

    /**
     * Создание модели космического корабля
     */
    createSpaceShip() {
        // Простая модель корабля из базовых геометрий
        const group = new THREE.Group();

        // Основной корпус
        const bodyGeometry = new THREE.ConeGeometry(1, 4, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        group.add(body);

        // Крылья
        const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.z = -1;
        group.add(wings);

        // Двигатели
        const engineGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
        const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        
        const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        leftEngine.position.set(-1.5, 0, -2);
        leftEngine.rotation.x = Math.PI / 2;
        group.add(leftEngine);

        const rightEngine = new THREE.Mesh(engineGeometry, engineMaterial);
        rightEngine.position.set(1.5, 0, -2);
        rightEngine.rotation.x = Math.PI / 2;
        group.add(rightEngine);

        this.mesh = group;
        this.mesh.name = 'SpaceShip';
    }

    /**
     * Установка позиции корабля
     * @param {number} x - X координата
     * @param {number} y - Y координата 
     * @param {number} z - Z координата
     */
    setPosition(x, y, z) {
        if (this.mesh) {
            this.mesh.position.set(x, y, z);
        }
    }

    /**
     * Обновление корабля
     * @param {number} deltaTime - Время с последнего кадра
     */
    update(deltaTime) {
        // Базовая физика движения
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        this.velocity.clampLength(0, this.maxSpeed);
        
        if (this.mesh) {
            this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        }

        // Затухание ускорения
        this.acceleration.multiplyScalar(0.9);
    }

    /**
     * Получить меш корабля
     * @returns {THREE.Group} Меш корабля
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Применить тягу в направлении
     * @param {THREE.Vector3} direction - Направление тяги
     */
    applyThrust(direction) {
        const force = direction.clone().normalize().multiplyScalar(this.thrust);
        this.acceleration.add(force);
    }

    /**
     * Освобождение ресурсов
     */
    dispose() {
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
} 