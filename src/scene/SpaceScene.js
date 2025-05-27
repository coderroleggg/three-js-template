import * as THREE from 'three';
import { Planet } from '../objects/Planet.js';
import { StarField } from '../objects/StarField.js';
import { SpaceShip } from '../objects/SpaceShip.js';

/**
 * Космическая сцена - содержит все объекты космоса
 */
export class SpaceScene {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.planets = [];
        this.starField = null;
        this.spaceShip = null;
        this.time = 0;
        
        // Система освещения
        this.ambientLight = null;
        this.directionalLight = null;
        this.pointLights = [];
        
        // Загрузчик текстур
        this.textureLoader = new THREE.TextureLoader();
        
        // Интерактивность
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedPlanet = null;
        
        this.setupInteraction();
    }

    /**
     * Настройка интерактивности
     */
    setupInteraction() {
        window.addEventListener('click', (event) => this.onMouseClick(event));
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
    }

    /**
     * Установка камеры для интерактивности
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Обработка клика мыши
     */
    onMouseClick(event) {
        if (!this.camera) return;
        
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const planetMeshes = this.planets.map(planet => planet.getMesh());
        const intersects = this.raycaster.intersectObjects(planetMeshes);

        if (intersects.length > 0) {
            const clickedPlanet = this.planets.find(planet => planet.getMesh() === intersects[0].object);
            if (clickedPlanet) {
                this.selectPlanet(clickedPlanet);
            }
        } else {
            this.deselectPlanet();
        }
    }

    /**
     * Обработка движения мыши
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    /**
     * Выбор планеты
     */
    selectPlanet(planet) {
        this.deselectPlanet(); // Сначала снимаем выделение с предыдущей
        this.selectedPlanet = planet;
        planet.setSelected(true);
        
        // Показываем информацию о планете
        this.showPlanetInfo(planet);
    }

    /**
     * Снятие выделения планеты
     */
    deselectPlanet() {
        if (this.selectedPlanet) {
            this.selectedPlanet.setSelected(false);
            this.selectedPlanet = null;
        }
        this.hidePlanetInfo();
    }

    /**
     * Показать информацию о планете
     */
    showPlanetInfo(planet) {
        // Создаем или обновляем панель информации
        let infoPanel = document.getElementById('planet-info');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'planet-info';
            infoPanel.style.cssText = `
                position: fixed;
                top: 50%;
                right: 20px;
                transform: translateY(-50%);
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                color: white;
                padding: 20px;
                border-radius: 10px;
                border: 1px solid rgba(0, 255, 255, 0.3);
                max-width: 300px;
                font-family: Arial, sans-serif;
                z-index: 1000;
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(infoPanel);
        }

        const config = planet.config;
        infoPanel.innerHTML = `
            <h3 style="color: #00ffff; margin-top: 0;">${config.name}</h3>
            <p><strong>Радиус:</strong> ${config.radius} ед.</p>
            <p><strong>Орбита:</strong> ${config.orbit ? config.orbit.radius + ' ед.' : 'Неподвижно'}</p>
            <p><strong>Скорость вращения:</strong> ${config.rotation.y.toFixed(3)}</p>
            ${config.orbit ? `<p><strong>Орбитальная скорость:</strong> ${config.orbit.speed.toFixed(3)}</p>` : ''}
            ${config.hasRings ? '<p style="color: #ffd700;"><strong>✨ Имеет кольца</strong></p>' : ''}
        `;
        infoPanel.style.opacity = '1';
    }

    /**
     * Скрыть информацию о планете
     */
    hidePlanetInfo() {
        const infoPanel = document.getElementById('planet-info');
        if (infoPanel) {
            infoPanel.style.opacity = '0';
            setTimeout(() => {
                if (infoPanel.parentNode) {
                    infoPanel.parentNode.removeChild(infoPanel);
                }
            }, 300);
        }
    }

    /**
     * Создание процедурных текстур
     */
    createProceduralTexture(type, colors, size = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        switch (type) {
            case 'sun':
                this.createSunTexture(ctx, size, colors);
                break;
            case 'earth':
                this.createEarthTexture(ctx, size, colors);
                break;
            case 'mars':
                this.createMarsTexture(ctx, size, colors);
                break;
            case 'gas_giant':
                this.createGasGiantTexture(ctx, size, colors);
                break;
            default:
                this.createBasicPlanetTexture(ctx, size, colors);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Создание текстуры солнца
     */
    createSunTexture(ctx, size, colors) {
        // Создаем градиент для солнца
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.3, '#ffaa00');
        gradient.addColorStop(0.6, '#ff6600');
        gradient.addColorStop(1, '#cc3300');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Добавляем солнечные пятна
        ctx.globalCompositeOperation = 'multiply';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 20 + 5;
            
            const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            spotGradient.addColorStop(0, 'rgba(100, 50, 0, 0.8)');
            spotGradient.addColorStop(1, 'rgba(100, 50, 0, 0)');
            
            ctx.fillStyle = spotGradient;
            ctx.fillRect(0, 0, size, size);
        }
    }

    /**
     * Создание текстуры Земли
     */
    createEarthTexture(ctx, size, colors) {
        // Основной синий цвет океанов
        ctx.fillStyle = '#1e4d72';
        ctx.fillRect(0, 0, size, size);
        
        // Добавляем континенты
        ctx.fillStyle = '#8fbc8f';
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 80 + 40,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Добавляем облака
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 30; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 40 + 20,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    /**
     * Создание текстуры Марса
     */
    createMarsTexture(ctx, size, colors) {
        // Основной красный цвет
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#cd853f');
        gradient.addColorStop(0.5, '#cd5c5c');
        gradient.addColorStop(1, '#8b4513');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Добавляем кратеры
        ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.arc(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 30 + 10,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
        
        // Полярные шапки
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(size/2, 0, 40, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(size/2, size, 40, Math.PI, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Создание текстуры газового гиганта
     */
    createGasGiantTexture(ctx, size, colors) {
        // Создаем полосы газового гиганта
        const stripeHeight = size / 15;
        for (let i = 0; i < 15; i++) {
            const hue = 30 + Math.random() * 60; // Оттенки оранжевого/коричневого
            const lightness = 40 + Math.random() * 40;
            ctx.fillStyle = `hsl(${hue}, 60%, ${lightness}%)`;
            ctx.fillRect(0, i * stripeHeight, size, stripeHeight);
        }
        
        // Добавляем вихри
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.ellipse(
                Math.random() * size,
                Math.random() * size,
                Math.random() * 30 + 20,
                Math.random() * 15 + 10,
                Math.random() * Math.PI,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }

    /**
     * Создание базовой текстуры планеты
     */
    createBasicPlanetTexture(ctx, size, colors) {
        const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, colors[0] || '#888888');
        gradient.addColorStop(1, colors[1] || '#444444');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Добавляем случайные пятна
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = Math.random() * 20 + 5;
            
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Инициализация космической сцены
     */
    async init() {
        console.log('🌌 Создание космической сцены...');
        
        // Создание освещения
        this.createLighting();
        
        // Создание звездного поля
        this.createStarField();
        
        // Создание планет
        this.createPlanets();
        
        // Создание космического корабля
        // this.createSpaceShip();
        
        console.log('✨ Космическая сцена создана');
    }

    /**
     * Создание системы освещения
     */
    createLighting() {
        // Окружающий свет
        this.ambientLight = new THREE.AmbientLight(0x2c4870, 0.3);
        this.scene.add(this.ambientLight);

        // Основной направленный свет (солнце)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.directionalLight.position.set(100, 100, 50);
        this.directionalLight.castShadow = true;
        
        // Настройка теней
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = 100;
        this.directionalLight.shadow.camera.bottom = -100;
        
        this.scene.add(this.directionalLight);

        // Дополнительные точечные источники света
        this.createPointLights();
    }

    /**
     * Создание точечных источников света
     */
    createPointLights() {
        const lightConfigs = [
            { color: 0xff6b35, intensity: 2, position: [50, 30, 80] },
            { color: 0x4ecdc4, intensity: 1.5, position: [-70, -20, 60] },
            { color: 0xff6b9d, intensity: 1.8, position: [40, -50, -30] }
        ];

        lightConfigs.forEach(config => {
            const light = new THREE.PointLight(config.color, config.intensity, 200);
            light.position.set(...config.position);
            this.pointLights.push(light);
            this.scene.add(light);

            // Добавление визуального индикатора света
            const lightGeometry = new THREE.SphereGeometry(1, 8, 8);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: config.color });
            const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
            lightMesh.position.copy(light.position);
            this.scene.add(lightMesh);
        });
    }

    /**
     * Создание звездного поля
     */
    createStarField() {
        this.starField = new StarField();
        this.scene.add(this.starField.getMesh());
    }

    /**
     * Создание планет
     */
    createPlanets() {
        const planetConfigs = [
            {
                name: 'Солнце',
                radius: 8,
                position: [0, 0, 0],
                color: 0xffaa00,
                emissive: 0xff6600,
                rotation: { x: 0, y: 0.01, z: 0 },
                orbit: null,
                textureUrl: '/textures/sun_texture.png'
            },
            {
                name: 'Меркурий',
                radius: 1.5,
                position: [20, 0, 0],
                color: 0x8c7853,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.02, z: 0 },
                orbit: { radius: 20, speed: 0.02 },
                textureType: 'basic',
                textureColors: ['#8c7853', '#5a4a35']
            },
            {
                name: 'Венера',
                radius: 2.2,
                position: [30, 0, 0],
                color: 0xffc649,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.015, z: 0 },
                orbit: { radius: 30, speed: 0.015 },
                textureType: 'basic',
                textureColors: ['#ffc649', '#cc9933']
            },
            {
                name: 'Земля',
                radius: 2.5,
                position: [45, 0, 0],
                color: 0x6b93d6,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.01, z: 0 },
                orbit: { radius: 45, speed: 0.01 },
                textureUrl: '/textures/earth_texture.png'
            },
            {
                name: 'Марс',
                radius: 2,
                position: [60, 0, 0],
                color: 0xcd5c5c,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.008, z: 0 },
                orbit: { radius: 60, speed: 0.008 },
                textureUrl: '/textures/mars_texture.png'
            },
            {
                name: 'Юпитер',
                radius: 5,
                position: [85, 0, 0],
                color: 0xd2691e,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.006, z: 0 },
                orbit: { radius: 85, speed: 0.006 },
                textureUrl: '/textures/jupiter_texture.png'
            },
            {
                name: 'Сатурн',
                radius: 4.5,
                position: [110, 0, 0],
                color: 0xfad5a5,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.005, z: 0 },
                orbit: { radius: 110, speed: 0.005 },
                hasRings: true,
                textureType: 'gas_giant'
            },
            {
                name: 'Уран',
                radius: 3,
                position: [130, 0, 0],
                color: 0x4fd0e4,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.004, z: 0 },
                orbit: { radius: 130, speed: 0.004 },
                textureType: 'basic',
                textureColors: ['#4fd0e4', '#2fa8cc']
            },
            {
                name: 'Нептун',
                radius: 3,
                position: [150, 0, 0],
                color: 0x4169e1,
                emissive: 0x000000,
                rotation: { x: 0, y: 0.003, z: 0 },
                orbit: { radius: 150, speed: 0.003 },
                textureType: 'basic',
                textureColors: ['#4169e1', '#2947a1']
            }
        ];

        planetConfigs.forEach(config => {
            // Загружаем текстуру из файла или создаем процедурную
            if (config.textureUrl) {
                config.texture = this.textureLoader.load(config.textureUrl);
                config.texture.colorSpace = THREE.SRGBColorSpace;
            } else if (config.textureType) {
                config.texture = this.createProceduralTexture(
                    config.textureType, 
                    config.textureColors || [],
                    512
                );
            }
            
            const planet = new Planet(config);
            this.planets.push(planet);
            this.scene.add(planet.getGroup());
        });
    }

    /**
     * Создание космического корабля
     */
    createSpaceShip() {
        this.spaceShip = new SpaceShip();
        this.spaceShip.setPosition(0, 10, 50);
        this.scene.add(this.spaceShip.getMesh());
    }

    /**
     * Обновление сцены
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    update(deltaTime) {
        this.time += deltaTime;

        // Обновление планет
        this.planets.forEach(planet => {
            planet.update(deltaTime, this.time);
        });

        // Обновление звездного поля
        if (this.starField) {
            this.starField.update(deltaTime);
        }

        // Обновление космического корабля
        if (this.spaceShip) {
            this.spaceShip.update(deltaTime);
        }

        // Анимация точечных источников света
        this.animateLights();
    }

    /**
     * Анимация освещения
     */
    animateLights() {
        this.pointLights.forEach((light, index) => {
            const offset = index * 2;
            light.intensity = 1.5 + Math.sin(this.time * 2 + offset) * 0.5;
            
            // Медленное движение источников света
            const baseX = light.position.x;
            const baseZ = light.position.z;
            light.position.x = baseX + Math.sin(this.time * 0.5 + offset) * 10;
            light.position.z = baseZ + Math.cos(this.time * 0.3 + offset) * 10;
        });
    }

    /**
     * Получить все планеты
     * @returns {Planet[]} Массив планет
     */
    getPlanets() {
        return this.planets;
    }

    /**
     * Получить планету по имени
     * @param {string} name - Имя планеты
     * @returns {Planet|null} Планета или null
     */
    getPlanetByName(name) {
        return this.planets.find(planet => planet.name === name) || null;
    }

    /**
     * Добавить объект в сцену
     * @param {THREE.Object3D} object - Объект для добавления
     */
    addObject(object) {
        this.scene.add(object);
    }

    /**
     * Удалить объект из сцены
     * @param {THREE.Object3D} object - Объект для удаления
     */
    removeObject(object) {
        this.scene.remove(object);
    }
} 