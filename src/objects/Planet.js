import * as THREE from 'three';

/**
 * Класс планеты с орбитальным движением и вращением
 */
export class Planet {
    constructor(config) {
        this.config = config; // Сохраняем конфиг для доступа из других классов
        this.name = config.name;
        this.radius = config.radius;
        this.color = config.color;
        this.emissive = config.emissive || 0x000000;
        this.rotation = config.rotation || { x: 0, y: 0.01, z: 0 };
        this.orbit = config.orbit; // { radius, speed }
        this.hasRings = config.hasRings || false;
        this.texture = config.texture || null;
        
        // Интерактивность
        this.isSelected = false;
        this.originalScale = 1.0;
        this.selectionGlow = null;
        
        // Группа для планеты и её спутников
        this.group = new THREE.Group();
        
        // Орбитальная группа (для движения по орбите)
        this.orbitGroup = new THREE.Group();
        
        // Меш планеты
        this.mesh = null;
        
        // Кольца (если есть)
        this.rings = null;
        
        // Орбитальная линия
        this.orbitLine = null;
        
        // Время для анимации
        this.time = 0;
        
        this.init(config.position);
    }

    /**
     * Инициализация планеты
     * @param {Array} position - Начальная позиция [x, y, z]
     */
    init(position) {
        // Создание геометрии и материала планеты
        this.createPlanet();
        
        // Создание колец (если нужно)
        if (this.hasRings) {
            this.createRings();
        }
        
        // Создание орбитальной линии
        if (this.orbit) {
            this.createOrbitLine();
        }
        
        // Установка позиции
        this.setPosition(position);
        
        // Сборка иерархии
        this.buildHierarchy();
    }

    /**
     * Создание планеты
     */
    createPlanet() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        // Создание материала в зависимости от типа планеты
        let material;
        
        if (this.name === 'Солнце') {
            // Светящийся материал для солнца
            material = new THREE.MeshBasicMaterial({
                color: this.color,
                emissive: this.emissive,
                emissiveIntensity: 0.8,
                map: this.texture
            });
        } else {
            // Улучшенный материал для планет с поддержкой освещения
            material = new THREE.MeshStandardMaterial({
                color: this.texture ? 0xffffff : this.color, // Белый если есть текстура
                emissive: this.emissive,
                roughness: 0.8,
                metalness: 0.1,
                map: this.texture
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.name;
        this.mesh.userData = { planet: this };
        
        // Добавление атмосферы для некоторых планет
        if (['Земля', 'Венера', 'Марс'].includes(this.name)) {
            this.createAtmosphere();
        }
        
        // Создание эффекта свечения для выделения
        this.createSelectionGlow();
    }

    /**
     * Создание эффекта свечения для выделения
     */
    createSelectionGlow() {
        const glowGeometry = new THREE.SphereGeometry(this.radius * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0,
            side: THREE.BackSide
        });
        
        this.selectionGlow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(this.selectionGlow);
    }

    /**
     * Установка состояния выделения
     * @param {boolean} selected - Выделена ли планета
     */
    setSelected(selected) {
        this.isSelected = selected;
        
        if (selected) {
            // Эффект увеличения
            this.mesh.scale.setScalar(1.1);
            
            // Эффект свечения
            if (this.selectionGlow) {
                this.selectionGlow.material.opacity = 0.3;
            }
            
            // Подсветка орбиты
            if (this.orbitLine) {
                this.orbitLine.material.color.setHex(0x00ffff);
                this.orbitLine.material.opacity = 0.8;
            }
        } else {
            // Возврат к нормальному размеру
            this.mesh.scale.setScalar(this.originalScale);
            
            // Убираем свечение
            if (this.selectionGlow) {
                this.selectionGlow.material.opacity = 0;
            }
            
            // Обычная орбита
            if (this.orbitLine) {
                this.orbitLine.material.color.setHex(0x444444);
                this.orbitLine.material.opacity = 0.3;
            }
        }
    }

    /**
     * Создание атмосферы планеты
     */
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.radius * 1.05, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.getAtmosphereColor(),
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        
        const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh.add(atmosphereMesh);
    }

    /**
     * Получить цвет атмосферы
     * @returns {number} Цвет атмосферы
     */
    getAtmosphereColor() {
        switch (this.name) {
            case 'Земля': return 0x87ceeb;
            case 'Венера': return 0xffc649;
            case 'Марс': return 0xcd5c5c;
            default: return 0x87ceeb;
        }
    }

    /**
     * Создание колец планеты
     */
    createRings() {
        const innerRadius = this.radius * 1.5;
        const outerRadius = this.radius * 2.5;
        const thetaSegments = 128;
        
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
        
        // Создаем процедурную текстуру для колец
        const ringTexture = this.createRingTexture();
        
        const material = new THREE.MeshBasicMaterial({
            map: ringTexture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        this.rings = new THREE.Mesh(geometry, material);
        this.rings.rotation.x = -Math.PI / 2; // Поворот колец горизонтально
        
        // Добавление анимации колец
        this.rings.userData = { rotationSpeed: 0.005 };
    }

    /**
     * Создание текстуры колец
     */
    createRingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Создаем градиент для колец
        const gradient = ctx.createRadialGradient(256, 256, 128, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(200, 180, 140, 1)');
        gradient.addColorStop(0.3, 'rgba(160, 140, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(120, 100, 60, 0.6)');
        gradient.addColorStop(0.7, 'rgba(100, 80, 40, 0.4)');
        gradient.addColorStop(1, 'rgba(80, 60, 20, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Добавляем случайные промежутки в кольцах
        ctx.globalCompositeOperation = 'destination-out';
        for (let i = 0; i < 20; i++) {
            const radius = 128 + Math.random() * 128;
            const width = Math.random() * 10 + 2;
            ctx.beginPath();
            ctx.arc(256, 256, radius, 0, Math.PI * 2);
            ctx.lineWidth = width;
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    /**
     * Создание орбитальной линии
     */
    createOrbitLine() {
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * this.orbit.radius;
            const z = Math.sin(angle) * this.orbit.radius;
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        this.orbitLine = new THREE.Line(geometry, material);
    }

    /**
     * Сборка иерархии объектов
     */
    buildHierarchy() {
        // Добавляем планету в орбитальную группу
        this.orbitGroup.add(this.mesh);
        
        // Добавляем кольца к планете (если есть)
        if (this.rings) {
            this.orbitGroup.add(this.rings);
        }
        
        // Добавляем орбитальную группу в основную группу
        this.group.add(this.orbitGroup);
        
        // Добавляем орбитальную линию в основную группу
        if (this.orbitLine) {
            this.group.add(this.orbitLine);
        }
    }

    /**
     * Установка позиции планеты
     * @param {Array} position - Позиция [x, y, z]
     */
    setPosition(position) {
        if (this.orbit) {
            // Для планет с орбитой устанавливаем начальную позицию орбитальной группы
            this.orbitGroup.position.set(position[0], position[1], position[2]);
        } else {
            // Для солнца устанавливаем позицию основной группы
            this.group.position.set(position[0], position[1], position[2]);
        }
    }

    /**
     * Обновление планеты
     * @param {number} deltaTime - Время с последнего кадра
     * @param {number} totalTime - Общее время
     */
    update(deltaTime, totalTime) {
        this.time = totalTime;
        
        // Вращение планеты вокруг своей оси
        this.mesh.rotation.x += this.rotation.x * deltaTime;
        this.mesh.rotation.y += this.rotation.y * deltaTime;
        this.mesh.rotation.z += this.rotation.z * deltaTime;
        
        // Орбитальное движение
        if (this.orbit) {
            const angle = totalTime * this.orbit.speed;
            const x = Math.cos(angle) * this.orbit.radius;
            const z = Math.sin(angle) * this.orbit.radius;
            this.orbitGroup.position.set(x, 0, z);
        }
        
        // Анимация колец
        if (this.rings) {
            this.rings.rotation.z += this.rings.userData.rotationSpeed * deltaTime;
        }
        
        // Дополнительные эффекты для солнца
        if (this.name === 'Солнце') {
            this.updateSunEffects();
        }
    }

    /**
     * Обновление эффектов солнца
     */
    updateSunEffects() {
        // Пульсация яркости
        const pulsation = 0.8 + Math.sin(this.time * 3) * 0.2;
        this.mesh.material.emissiveIntensity = pulsation;
        
        // Изменение размера (очень незначительное)
        const scale = 1 + Math.sin(this.time * 2) * 0.05;
        this.mesh.scale.setScalar(scale);
    }

    /**
     * Получить группу планеты
     * @returns {THREE.Group} Группа планеты
     */
    getGroup() {
        return this.group;
    }

    /**
     * Получить меш планеты
     * @returns {THREE.Mesh} Меш планеты
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Получить мировую позицию планеты
     * @returns {THREE.Vector3} Мировая позиция
     */
    getWorldPosition() {
        const worldPosition = new THREE.Vector3();
        this.mesh.getWorldPosition(worldPosition);
        return worldPosition;
    }

    /**
     * Установить видимость орбитальной линии
     * @param {boolean} visible - Видимость
     */
    setOrbitVisible(visible) {
        if (this.orbitLine) {
            this.orbitLine.visible = visible;
        }
    }

    /**
     * Добавить спутник к планете
     * @param {Planet} satellite - Спутник
     */
    addSatellite(satellite) {
        this.orbitGroup.add(satellite.getGroup());
    }

    /**
     * Освобождение ресурсов
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.rings) {
            this.rings.geometry.dispose();
            this.rings.material.dispose();
        }
        
        if (this.orbitLine) {
            this.orbitLine.geometry.dispose();
            this.orbitLine.material.dispose();
        }
    }
} 