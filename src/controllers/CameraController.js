import * as THREE from 'three';

/**
 * Контроллер камеры - расширенное управление камерой
 */
export class CameraController {
    constructor(camera, orbitControls) {
        this.camera = camera;
        this.orbitControls = orbitControls;
        
        // Пресеты камеры
        this.presets = {
            overview: { position: [0, 100, 200], target: [0, 0, 0] },
            sun: { position: [0, 20, 50], target: [0, 0, 0] },
            earth: { position: [45, 10, 20], target: [45, 0, 0] },
            saturn: { position: [110, 30, 60], target: [110, 0, 0] }
        };
        
        // Состояние анимации
        this.isAnimating = false;
        this.animationDuration = 2000; // 2 секунды
        
        // Автоследование за объектом
        this.followTarget = null;
        this.followOffset = new THREE.Vector3(10, 10, 10);
        this.followSpeed = 0.02;
    }

    /**
     * Обновление контроллера
     * @param {number} deltaTime - Время с последнего кадра
     */
    update(deltaTime) {
        // Автоследование за объектом
        if (this.followTarget && !this.isAnimating) {
            this.updateFollowTarget();
        }
    }

    /**
     * Анимированный переход к пресету камеры
     * @param {string} presetName - Имя пресета
     * @returns {Promise} Промис завершения анимации
     */
    async animateToPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            console.warn(`Пресет камеры "${presetName}" не найден`);
            return;
        }

        return this.animateToPosition(
            new THREE.Vector3(...preset.position),
            new THREE.Vector3(...preset.target)
        );
    }

    /**
     * Анимированный переход к позиции
     * @param {THREE.Vector3} targetPosition - Целевая позиция камеры
     * @param {THREE.Vector3} targetLookAt - Точка, на которую смотрит камера
     * @returns {Promise} Промис завершения анимации
     */
    animateToPosition(targetPosition, targetLookAt) {
        return new Promise((resolve) => {
            if (this.isAnimating) {
                resolve();
                return;
            }

            this.isAnimating = true;
            this.stopFollowing(); // Останавливаем следование

            const startPosition = this.camera.position.clone();
            const startTarget = this.orbitControls.target.clone();
            
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);
                
                // Используем easing функцию для плавности
                const easeProgress = this.easeInOutCubic(progress);

                // Интерполяция позиции камеры
                this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
                
                // Интерполяция цели
                this.orbitControls.target.lerpVectors(startTarget, targetLookAt, easeProgress);
                
                // Обновление контроллеров
                this.orbitControls.update();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isAnimating = false;
                    resolve();
                }
            };

            animate();
        });
    }

    /**
     * Функция плавности анимации (cubic ease-in-out)
     * @param {number} t - Прогресс от 0 до 1
     * @returns {number} Сглаженный прогресс
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    /**
     * Начать следование за объектом
     * @param {THREE.Object3D} target - Объект для следования
     * @param {THREE.Vector3} offset - Смещение от объекта
     */
    followObject(target, offset = null) {
        this.followTarget = target;
        if (offset) {
            this.followOffset.copy(offset);
        }
        
        console.log(`Камера начала следование за объектом: ${target.name || 'Unknown'}`);
    }

    /**
     * Остановить следование за объектом
     */
    stopFollowing() {
        if (this.followTarget) {
            console.log('Следование камеры остановлено');
            this.followTarget = null;
        }
    }

    /**
     * Обновление следования за целью
     */
    updateFollowTarget() {
        if (!this.followTarget) return;

        // Получаем мировую позицию цели
        const targetWorldPosition = new THREE.Vector3();
        this.followTarget.getWorldPosition(targetWorldPosition);

        // Вычисляем желаемую позицию камеры
        const desiredPosition = targetWorldPosition.clone().add(this.followOffset);
        
        // Плавно перемещаем камеру
        this.camera.position.lerp(desiredPosition, this.followSpeed);
        
        // Плавно поворачиваем камеру к цели
        this.orbitControls.target.lerp(targetWorldPosition, this.followSpeed);
        
        this.orbitControls.update();
    }

    /**
     * Установить скорость следования
     * @param {number} speed - Скорость от 0 до 1
     */
    setFollowSpeed(speed) {
        this.followSpeed = Math.max(0, Math.min(1, speed));
    }

    /**
     * Добавить новый пресет камеры
     * @param {string} name - Имя пресета
     * @param {Array} position - Позиция камеры [x, y, z]
     * @param {Array} target - Цель камеры [x, y, z]
     */
    addPreset(name, position, target) {
        this.presets[name] = {
            position: [...position],
            target: [...target]
        };
        console.log(`Добавлен пресет камеры: ${name}`);
    }

    /**
     * Сохранить текущую позицию как пресет
     * @param {string} name - Имя пресета
     */
    saveCurrentAsPreset(name) {
        const position = [
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z
        ];
        const target = [
            this.orbitControls.target.x,
            this.orbitControls.target.y,
            this.orbitControls.target.z
        ];
        
        this.addPreset(name, position, target);
    }

    /**
     * Получить список доступных пресетов
     * @returns {Array} Массив имен пресетов
     */
    getPresetNames() {
        return Object.keys(this.presets);
    }

    /**
     * Установить ограничения орбитального контроллера
     * @param {Object} limits - Ограничения {minDistance, maxDistance, minPolarAngle, maxPolarAngle}
     */
    setLimits(limits) {
        if (limits.minDistance !== undefined) {
            this.orbitControls.minDistance = limits.minDistance;
        }
        if (limits.maxDistance !== undefined) {
            this.orbitControls.maxDistance = limits.maxDistance;
        }
        if (limits.minPolarAngle !== undefined) {
            this.orbitControls.minPolarAngle = limits.minPolarAngle;
        }
        if (limits.maxPolarAngle !== undefined) {
            this.orbitControls.maxPolarAngle = limits.maxPolarAngle;
        }
    }

    /**
     * Включить/выключить автоматическое вращение
     * @param {boolean} enabled - Включить автовращение
     * @param {number} speed - Скорость вращения
     */
    setAutoRotate(enabled, speed = 2.0) {
        this.orbitControls.autoRotate = enabled;
        this.orbitControls.autoRotateSpeed = speed;
    }

    /**
     * Получить информацию о текущем состоянии камеры
     * @returns {Object} Информация о камере
     */
    getCameraInfo() {
        return {
            position: {
                x: this.camera.position.x.toFixed(2),
                y: this.camera.position.y.toFixed(2),
                z: this.camera.position.z.toFixed(2)
            },
            target: {
                x: this.orbitControls.target.x.toFixed(2),
                y: this.orbitControls.target.y.toFixed(2),
                z: this.orbitControls.target.z.toFixed(2)
            },
            distance: this.camera.position.distanceTo(this.orbitControls.target).toFixed(2),
            isAnimating: this.isAnimating,
            followTarget: this.followTarget ? this.followTarget.name || 'Unknown' : null
        };
    }
} 