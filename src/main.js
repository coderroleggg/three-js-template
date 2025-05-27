import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SpaceScene } from './scene/SpaceScene.js';
import { CameraController } from './controllers/CameraController.js';
import { InputManager } from './managers/InputManager.js';
import { UIManager } from './managers/UIManager.js';
import { GameLoop } from './core/GameLoop.js';

/**
 * Three.js Space Game Template
 * Крутой базовый шаблон для создания космических игр и приложений
 */
class SpaceGameApp {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.controls = null;
        this.spaceScene = null;
        this.gameLoop = null;
        this.uiManager = null;
        this.inputManager = null;
        this.cameraController = null;
        
        // Статистика
        this.stats = {
            fps: 0,
            frameCount: 0,
            lastTime: 0,
            startTime: Date.now()
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Инициализация Space Game Template...');
            
            // Инициализация рендерера
            this.initRenderer();
            
            // Инициализация камеры
            this.initCamera();
            
            // Инициализация сцены
            this.initScene();
            
            // Инициализация контроллеров
            this.initControls();
            
            // Инициализация менеджеров
            this.initManagers();
            
            // Создание космической сцены
            await this.createSpaceScene();
            
            // Запуск игрового цикла
            this.startGameLoop();
            
            // Скрытие экрана загрузки
            this.hideLoading();
            
            console.log('✅ Space Game Template инициализирован успешно!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
        }
    }

    initRenderer() {
        const container = document.getElementById('canvas-container');
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000011, 1);
        
        // Включение теней
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Настройка тонового отображения
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        container.appendChild(this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // поле зрения
            window.innerWidth / window.innerHeight, // соотношение сторон
            0.1, // ближняя плоскость отсечения
            10000 // дальняя плоскость отсечения
        );
        
        this.camera.position.set(0, 50, 100);
    }

    initScene() {
        this.scene = new THREE.Scene();
        
        // Добавление тумана для атмосферы
        this.scene.fog = new THREE.Fog(0x000011, 100, 2000);
    }

    initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000;
        this.controls.maxPolarAngle = Math.PI;
    }

    initManagers() {
        this.uiManager = new UIManager();
        this.inputManager = new InputManager();
        
        // Инициализация контроллера камеры с InputManager
        this.cameraController = new CameraController(this.camera, this.controls, this.inputManager);
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Добавление горячих клавиш
        this.setupHotkeys();
    }
    
    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        this.inputManager.addCallback('keyDown', (keyCode) => {
            switch (keyCode) {
                case 'KeyC':
                    // Переключение режима камеры
                    const newMode = this.cameraController.controlMode === 'orbit' ? 'free' : 'orbit';
                    this.cameraController.setControlMode(newMode);
                    this.showNotification(`Режим камеры: ${newMode === 'orbit' ? 'Орбитальный' : 'Свободный'}`);
                    break;
                case 'KeyV':
                    // Переключение WASD
                    this.cameraController.setWASDEnabled(!this.cameraController.wasdEnabled);
                    this.showNotification(`WASD: ${this.cameraController.wasdEnabled ? 'Включено' : 'Выключено'}`);
                    break;
                case 'Digit1':
                    this.cameraController.animateToPreset('overview');
                    break;
                case 'Digit2':
                    this.cameraController.animateToPreset('sun');
                    break;
                case 'Digit3':
                    this.cameraController.animateToPreset('earth');
                    break;
                case 'Digit4':
                    this.cameraController.animateToPreset('saturn');
                    break;
            }
        });
    }
    
    /**
     * Показать уведомление
     */
    showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            font-family: Arial, sans-serif;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => notification.style.opacity = '1', 10);
        
        // Удаление через 3 секунды
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    async createSpaceScene() {
        this.spaceScene = new SpaceScene(this.scene, this.renderer);
        this.spaceScene.setCamera(this.camera);
        await this.spaceScene.init();
    }

    startGameLoop() {
        this.gameLoop = new GameLoop();
        this.gameLoop.start((deltaTime) => this.update(deltaTime), () => this.render());
    }

    update(deltaTime) {
        // Обновление контроллеров
        this.controls.update();
        this.cameraController.update(deltaTime);
        
        // Обновление космической сцены
        if (this.spaceScene) {
            this.spaceScene.update(deltaTime);
        }
        
        // Обновление статистики
        this.updateStats();
        
        // Обновление UI
        this.uiManager.update({
            fps: this.stats.fps,
            objects: this.scene.children.length,
            triangles: this.renderer.info.render.triangles,
            time: ((Date.now() - this.stats.startTime) / 1000).toFixed(1)
        });
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    updateStats() {
        this.stats.frameCount++;
        const now = Date.now();
        
        if (now - this.stats.lastTime >= 1000) {
            this.stats.fps = this.stats.frameCount;
            this.stats.frameCount = 0;
            this.stats.lastTime = now;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    hideLoading() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                loadingElement.style.display = 'none';
            }, 500);
        }
    }
}

// Запуск приложения
window.addEventListener('DOMContentLoaded', () => {
    new SpaceGameApp();
});

export default SpaceGameApp; 