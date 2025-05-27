/**
 * Менеджер ввода - обработка клавиатуры и мыши
 */
export class InputManager {
    constructor() {
        this.keys = new Set();
        this.mousePosition = { x: 0, y: 0 };
        this.mouseButtons = new Set();
        this.mouseDelta = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };
        
        // Колбэки для событий
        this.callbacks = {
            keyDown: [],
            keyUp: [],
            mouseDown: [],
            mouseUp: [],
            mouseMove: [],
            wheel: []
        };
        
        this.init();
    }

    /**
     * Инициализация менеджера ввода
     */
    init() {
        this.setupEventListeners();
        console.log('⌨️ Input Manager инициализирован');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Клавиатура
        document.addEventListener('keydown', (event) => this.handleKeyDown(event));
        document.addEventListener('keyup', (event) => this.handleKeyUp(event));
        
        // Мышь
        document.addEventListener('mousedown', (event) => this.handleMouseDown(event));
        document.addEventListener('mouseup', (event) => this.handleMouseUp(event));
        document.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        document.addEventListener('wheel', (event) => this.handleWheel(event));
        
        // Контекстное меню (отключаем для правой кнопки мыши)
        document.addEventListener('contextmenu', (event) => event.preventDefault());
        
        // Фокус окна (сброс состояния при потере фокуса)
        window.addEventListener('blur', () => this.resetInput());
    }

    /**
     * Обработка нажатия клавиши
     * @param {KeyboardEvent} event - Событие клавиатуры
     */
    handleKeyDown(event) {
        this.keys.add(event.code);
        
        // Вызов колбэков
        this.callbacks.keyDown.forEach(callback => {
            callback(event.code, event);
        });
    }

    /**
     * Обработка отпускания клавиши
     * @param {KeyboardEvent} event - Событие клавиатуры
     */
    handleKeyUp(event) {
        this.keys.delete(event.code);
        
        // Вызов колбэков
        this.callbacks.keyUp.forEach(callback => {
            callback(event.code, event);
        });
    }

    /**
     * Обработка нажатия кнопки мыши
     * @param {MouseEvent} event - Событие мыши
     */
    handleMouseDown(event) {
        this.mouseButtons.add(event.button);
        
        // Вызов колбэков
        this.callbacks.mouseDown.forEach(callback => {
            callback(event.button, event);
        });
    }

    /**
     * Обработка отпускания кнопки мыши
     * @param {MouseEvent} event - Событие мыши
     */
    handleMouseUp(event) {
        this.mouseButtons.delete(event.button);
        
        // Вызов колбэков
        this.callbacks.mouseUp.forEach(callback => {
            callback(event.button, event);
        });
    }

    /**
     * Обработка движения мыши
     * @param {MouseEvent} event - Событие мыши
     */
    handleMouseMove(event) {
        // Обновление позиции мыши
        this.lastMousePosition.x = this.mousePosition.x;
        this.lastMousePosition.y = this.mousePosition.y;
        
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
        
        // Вычисление дельты
        this.mouseDelta.x = this.mousePosition.x - this.lastMousePosition.x;
        this.mouseDelta.y = this.mousePosition.y - this.lastMousePosition.y;
        
        // Вызов колбэков
        this.callbacks.mouseMove.forEach(callback => {
            callback(this.mousePosition, this.mouseDelta, event);
        });
    }

    /**
     * Обработка колесика мыши
     * @param {WheelEvent} event - Событие колесика
     */
    handleWheel(event) {
        // Вызов колбэков
        this.callbacks.wheel.forEach(callback => {
            callback(event.deltaY, event);
        });
    }

    /**
     * Проверка нажатия клавиши
     * @param {string} keyCode - Код клавиши
     * @returns {boolean} Нажата ли клавиша
     */
    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }

    /**
     * Проверка нажатия кнопки мыши
     * @param {number} button - Номер кнопки мыши (0 - левая, 1 - средняя, 2 - правая)
     * @returns {boolean} Нажата ли кнопка
     */
    isMouseButtonPressed(button) {
        return this.mouseButtons.has(button);
    }

    /**
     * Получить позицию мыши
     * @returns {Object} Позиция мыши {x, y}
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }

    /**
     * Получить дельту движения мыши
     * @returns {Object} Дельта мыши {x, y}
     */
    getMouseDelta() {
        return { ...this.mouseDelta };
    }

    /**
     * Добавить колбэк для события
     * @param {string} eventType - Тип события
     * @param {Function} callback - Функция колбэка
     */
    addCallback(eventType, callback) {
        if (this.callbacks[eventType]) {
            this.callbacks[eventType].push(callback);
        }
    }

    /**
     * Удалить колбэк для события
     * @param {string} eventType - Тип события
     * @param {Function} callback - Функция колбэка
     */
    removeCallback(eventType, callback) {
        if (this.callbacks[eventType]) {
            const index = this.callbacks[eventType].indexOf(callback);
            if (index > -1) {
                this.callbacks[eventType].splice(index, 1);
            }
        }
    }

    /**
     * Сброс состояния ввода
     */
    resetInput() {
        this.keys.clear();
        this.mouseButtons.clear();
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
    }

    /**
     * Проверка комбинации клавиш
     * @param {Array} keyCodes - Массив кодов клавиш
     * @returns {boolean} Нажата ли комбинация
     */
    isKeyCombinationPressed(keyCodes) {
        return keyCodes.every(keyCode => this.keys.has(keyCode));
    }

    /**
     * Получить все нажатые клавиши
     * @returns {Array} Массив нажатых клавиш
     */
    getPressedKeys() {
        return Array.from(this.keys);
    }

    /**
     * Получить все нажатые кнопки мыши
     * @returns {Array} Массив нажатых кнопок мыши
     */
    getPressedMouseButtons() {
        return Array.from(this.mouseButtons);
    }

    /**
     * Проверка нажатия WASD
     * @returns {Object} Состояние WASD {w, a, s, d}
     */
    getWASDState() {
        return {
            w: this.isKeyPressed('KeyW'),
            a: this.isKeyPressed('KeyA'),
            s: this.isKeyPressed('KeyS'),
            d: this.isKeyPressed('KeyD')
        };
    }

    /**
     * Проверка нажатия стрелок
     * @returns {Object} Состояние стрелок {up, down, left, right}
     */
    getArrowState() {
        return {
            up: this.isKeyPressed('ArrowUp'),
            down: this.isKeyPressed('ArrowDown'),
            left: this.isKeyPressed('ArrowLeft'),
            right: this.isKeyPressed('ArrowRight')
        };
    }

    /**
     * Получить нормализованные координаты мыши (от -1 до 1)
     * @returns {Object} Нормализованные координаты {x, y}
     */
    getNormalizedMousePosition() {
        return {
            x: (this.mousePosition.x / window.innerWidth) * 2 - 1,
            y: -(this.mousePosition.y / window.innerHeight) * 2 + 1
        };
    }

    /**
     * Создать обработчик движения для конкретного элемента
     * @param {HTMLElement} element - HTML элемент
     * @param {Function} callback - Колбэк для движения
     */
    createDragHandler(element, callback) {
        let isDragging = false;
        let dragStartPos = { x: 0, y: 0 };

        element.addEventListener('mousedown', (event) => {
            isDragging = true;
            dragStartPos.x = event.clientX;
            dragStartPos.y = event.clientY;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const deltaX = event.clientX - dragStartPos.x;
                const deltaY = event.clientY - dragStartPos.y;
                callback(deltaX, deltaY, event);
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'grab';
            }
        });
    }

    /**
     * Получить информацию о текущем состоянии ввода
     * @returns {Object} Информация о состоянии ввода
     */
    getInputState() {
        return {
            pressedKeys: this.getPressedKeys(),
            pressedMouseButtons: this.getPressedMouseButtons(),
            mousePosition: this.getMousePosition(),
            mouseDelta: this.getMouseDelta(),
            wasd: this.getWASDState(),
            arrows: this.getArrowState()
        };
    }
} 