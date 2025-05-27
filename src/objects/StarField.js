import * as THREE from 'three';

/**
 * Звездное поле - создает фон из мерцающих звезд
 */
export class StarField {
    constructor(starCount = 15000) {
        this.starCount = starCount;
        this.mesh = null;
        this.geometry = null;
        this.material = null;
        this.time = 0;
        
        // Параметры анимации
        this.twinkleSpeed = 2.0;
        this.twinkleIntensity = 0.5;
        
        this.init();
    }

    /**
     * Инициализация звездного поля
     */
    init() {
        this.createStars();
        console.log(`✨ Создано звездное поле с ${this.starCount} звездами`);
    }

    /**
     * Создание звезд
     */
    createStars() {
        this.geometry = new THREE.BufferGeometry();
        
        // Массивы для позиций, цветов и размеров звезд
        const positions = new Float32Array(this.starCount * 3);
        const colors = new Float32Array(this.starCount * 3);
        const sizes = new Float32Array(this.starCount);
        const phases = new Float32Array(this.starCount); // Фазы для мерцания
        
        // Цвета звезд (различные оттенки белого, голубого, желтого, красного)
        const starColors = [
            new THREE.Color(0xffffff), // Белый
            new THREE.Color(0x87ceeb), // Голубой
            new THREE.Color(0xffd700), // Желтый
            new THREE.Color(0xffa500), // Оранжевый
            new THREE.Color(0xff6347), // Красный
            new THREE.Color(0xe6e6fa), // Лавандовый
            new THREE.Color(0xf0f8ff)  // Алисово-голубой
        ];

        for (let i = 0; i < this.starCount; i++) {
            const i3 = i * 3;
            
            // Случайные позиции в сфере большого радиуса
            const radius = 2000 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Случайный цвет звезды
            const color = starColors[Math.floor(Math.random() * starColors.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Случайный размер звезды (больше звезды встречаются реже)
            const random = Math.random();
            if (random < 0.1) {
                sizes[i] = 3 + Math.random() * 2; // Большие звезды
            } else if (random < 0.3) {
                sizes[i] = 2 + Math.random() * 1; // Средние звезды
            } else {
                sizes[i] = 1 + Math.random() * 1; // Маленькие звезды
            }
            
            // Случайная фаза мерцания
            phases[i] = Math.random() * Math.PI * 2;
        }

        // Установка атрибутов геометрии
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 3));
        this.geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

        // Создание материала с кастомным шейдером для мерцания
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0.0 },
                twinkleSpeed: { value: this.twinkleSpeed },
                twinkleIntensity: { value: this.twinkleIntensity }
            },
            vertexShader: this.getVertexShader(),
            fragmentShader: this.getFragmentShader(),
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Создание меша
        this.mesh = new THREE.Points(this.geometry, this.material);
        this.mesh.name = 'StarField';
    }

    /**
     * Вершинный шейдер
     * @returns {string} Код вершинного шейдера
     */
    getVertexShader() {
        return `
            attribute float size;
            attribute float phase;
            
            uniform float time;
            uniform float twinkleSpeed;
            uniform float twinkleIntensity;
            
            varying vec3 vColor;
            varying float vTwinkle;
            
            void main() {
                vColor = color;
                
                // Вычисление мерцания
                float twinkle = sin(time * twinkleSpeed + phase) * twinkleIntensity + 1.0;
                vTwinkle = twinkle;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }

    /**
     * Фрагментный шейдер
     * @returns {string} Код фрагментного шейдера
     */
    getFragmentShader() {
        return `
            varying vec3 vColor;
            varying float vTwinkle;
            
            void main() {
                // Создание круглой формы звезды
                float distance = length(gl_PointCoord - vec2(0.5));
                float alpha = 1.0 - smoothstep(0.1, 0.5, distance);
                
                // Добавление свечения
                float glow = exp(-distance * 8.0) * 0.5;
                alpha += glow;
                
                // Применение цвета и мерцания
                vec3 finalColor = vColor * vTwinkle;
                
                gl_FragColor = vec4(finalColor, alpha * vTwinkle);
            }
        `;
    }

    /**
     * Обновление звездного поля
     * @param {number} deltaTime - Время с последнего кадра в секундах
     */
    update(deltaTime) {
        this.time += deltaTime;
        
        if (this.material && this.material.uniforms) {
            this.material.uniforms.time.value = this.time;
        }
    }

    /**
     * Получить меш звездного поля
     * @returns {THREE.Points} Меш звездного поля
     */
    getMesh() {
        return this.mesh;
    }

    /**
     * Установить интенсивность мерцания
     * @param {number} intensity - Интенсивность мерцания (0.0 - 1.0)
     */
    setTwinkleIntensity(intensity) {
        this.twinkleIntensity = Math.max(0.0, Math.min(1.0, intensity));
        if (this.material && this.material.uniforms) {
            this.material.uniforms.twinkleIntensity.value = this.twinkleIntensity;
        }
    }

    /**
     * Установить скорость мерцания
     * @param {number} speed - Скорость мерцания
     */
    setTwinkleSpeed(speed) {
        this.twinkleSpeed = Math.max(0.1, speed);
        if (this.material && this.material.uniforms) {
            this.material.uniforms.twinkleSpeed.value = this.twinkleSpeed;
        }
    }

    /**
     * Изменить количество звезд
     * @param {number} count - Новое количество звезд
     */
    setStarCount(count) {
        if (count !== this.starCount) {
            this.starCount = count;
            this.dispose();
            this.createStars();
        }
    }

    /**
     * Получить информацию о звездном поле
     * @returns {Object} Информация о звездном поле
     */
    getInfo() {
        return {
            starCount: this.starCount,
            twinkleSpeed: this.twinkleSpeed,
            twinkleIntensity: this.twinkleIntensity,
            triangles: 0, // Points не используют треугольники
            vertices: this.starCount
        };
    }

    /**
     * Освобождение ресурсов
     */
    dispose() {
        if (this.geometry) {
            this.geometry.dispose();
        }
        
        if (this.material) {
            this.material.dispose();
        }
    }
} 