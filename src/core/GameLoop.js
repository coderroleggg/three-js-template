/**
 * Игровой цикл - управляет обновлениями и рендерингом сцены
 */
export class GameLoop {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameTime = 1000 / this.targetFPS;
        this.accumulator = 0;
        this.currentTime = 0;
        
        // Колбэки
        this.updateCallback = null;
        this.renderCallback = null;
        
        // Bind контекста для requestAnimationFrame
        this.loop = this.loop.bind(this);
    }

    /**
     * Запуск игрового цикла
     * @param {Function} updateCallback - Функция обновления логики
     * @param {Function} renderCallback - Функция рендеринга
     */
    start(updateCallback, renderCallback) {
        if (this.isRunning) {
            console.warn('Игровой цикл уже запущен');
            return;
        }

        this.updateCallback = updateCallback;
        this.renderCallback = renderCallback;
        this.isRunning = true;
        this.lastTime = performance.now();
        
        console.log('🎮 Игровой цикл запущен');
        requestAnimationFrame(this.loop);
    }

    /**
     * Остановка игрового цикла
     */
    stop() {
        this.isRunning = false;
        console.log('⏹️ Игровой цикл остановлен');
    }

    /**
     * Основной цикл игры
     * @param {number} timestamp - Временная метка
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        this.currentTime = timestamp;
        let deltaTime = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;

        // Ограничение deltaTime для предотвращения больших скачков
        deltaTime = Math.min(deltaTime, 50); // максимум 50ms

        this.accumulator += deltaTime;

        // Фиксированный шаг обновления для стабильности физики
        while (this.accumulator >= this.frameTime) {
            if (this.updateCallback) {
                this.updateCallback(this.frameTime / 1000); // передаем в секундах
            }
            this.accumulator -= this.frameTime;
        }

        // Рендеринг всегда происходит с максимальной частотой
        if (this.renderCallback) {
            this.renderCallback();
        }

        requestAnimationFrame(this.loop);
    }

    /**
     * Получить текущий FPS
     * @returns {number} Текущий FPS
     */
    getCurrentFPS() {
        return Math.round(1000 / (this.currentTime - this.lastTime));
    }

    /**
     * Установить целевой FPS
     * @param {number} fps - Целевой FPS
     */
    setTargetFPS(fps) {
        this.targetFPS = fps;
        this.frameTime = 1000 / this.targetFPS;
    }
} 