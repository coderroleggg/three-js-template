/**
 * Менеджер пользовательского интерфейса
 */
export class UIManager {
    constructor() {
        this.elements = {
            fps: document.getElementById('fps'),
            objects: document.getElementById('objects'),
            triangles: document.getElementById('triangles'),
            time: document.getElementById('time')
        };
        
        this.lastUpdateTime = 0;
        this.updateInterval = 100; // Обновлять UI каждые 100ms для плавности
        
        this.init();
    }

    /**
     * Инициализация UI менеджера
     */
    init() {
        console.log('🖥️ UI Manager инициализирован');
        this.setupEventListeners();
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработчик клавиш для быстрых команд
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    /**
     * Обработка нажатий клавиш
     * @param {KeyboardEvent} event - Событие клавиатуры
     */
    handleKeyPress(event) {
        switch (event.code) {
            case 'KeyH':
                this.toggleHelp();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
            case 'KeyS':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.saveScreenshot();
                }
                break;
            case 'Escape':
                this.hideAllPanels();
                break;
        }
    }

    /**
     * Обновление статистики UI
     * @param {Object} stats - Объект со статистикой
     */
    update(stats) {
        const now = Date.now();
        
        // Ограничение частоты обновления UI
        if (now - this.lastUpdateTime < this.updateInterval) {
            return;
        }
        
        this.lastUpdateTime = now;

        // Обновление элементов UI
        if (this.elements.fps && stats.fps !== undefined) {
            this.elements.fps.textContent = stats.fps;
            this.updateFPSColor(stats.fps);
        }

        if (this.elements.objects && stats.objects !== undefined) {
            this.elements.objects.textContent = stats.objects;
        }

        if (this.elements.triangles && stats.triangles !== undefined) {
            this.elements.triangles.textContent = this.formatNumber(stats.triangles);
        }

        if (this.elements.time && stats.time !== undefined) {
            this.elements.time.textContent = stats.time;
        }
    }

    /**
     * Обновление цвета FPS в зависимости от производительности
     * @param {number} fps - Текущий FPS
     */
    updateFPSColor(fps) {
        if (!this.elements.fps) return;

        if (fps >= 55) {
            this.elements.fps.style.color = '#00ff00'; // Зеленый
        } else if (fps >= 30) {
            this.elements.fps.style.color = '#ffaa00'; // Оранжевый
        } else {
            this.elements.fps.style.color = '#ff0000'; // Красный
        }
    }

    /**
     * Форматирование больших чисел
     * @param {number} num - Число для форматирования
     * @returns {string} Отформатированное число
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * Показать уведомление
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (info, warning, error, success)
     * @param {number} duration - Длительность показа в миллисекундах
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '1000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease'
        });

        // Цвета в зависимости от типа
        const colors = {
            info: 'rgba(0, 123, 255, 0.8)',
            warning: 'rgba(255, 193, 7, 0.8)',
            error: 'rgba(220, 53, 69, 0.8)',
            success: 'rgba(40, 167, 69, 0.8)'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // Удаление уведомления
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Переключение полноэкранного режима
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.showNotification('Полноэкранный режим включен', 'info');
            }).catch(() => {
                this.showNotification('Ошибка включения полноэкранного режима', 'error');
            });
        } else {
            document.exitFullscreen().then(() => {
                this.showNotification('Полноэкранный режим выключен', 'info');
            });
        }
    }

    /**
     * Переключение панели помощи
     */
    toggleHelp() {
        let helpPanel = document.getElementById('help-panel');
        
        if (!helpPanel) {
            helpPanel = this.createHelpPanel();
            document.body.appendChild(helpPanel);
        }
        
        helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
    }

    /**
     * Создание панели помощи
     * @returns {HTMLElement} Элемент панели помощи
     */
    createHelpPanel() {
        const panel = document.createElement('div');
        panel.id = 'help-panel';
        panel.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(10px);
                        padding: 30px; border-radius: 15px; color: white; z-index: 1000;
                        border: 1px solid rgba(255, 255, 255, 0.2); max-width: 500px;">
                <h2 style="margin: 0 0 20px 0; color: #00ffff; text-align: center;">
                    🚀 Управление
                </h2>
                <div style="line-height: 1.8;">
                    <div><span style="color: #00ffff;">Мышь:</span> Вращение и приближение</div>
                    <div><span style="color: #00ffff;">H:</span> Показать/скрыть помощь</div>
                    <div><span style="color: #00ffff;">F:</span> Полноэкранный режим</div>
                    <div><span style="color: #00ffff;">Ctrl+S:</span> Сохранить скриншот</div>
                    <div><span style="color: #00ffff;">ESC:</span> Закрыть панели</div>
                    <div><span style="color: #00ffff;">1-9:</span> Быстрый переход к планетам</div>
                </div>
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.style.display='none'"
                            style="background: #00ffff; color: black; border: none; padding: 10px 20px;
                                   border-radius: 5px; cursor: pointer; font-weight: bold;">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        
        return panel;
    }

    /**
     * Сохранение скриншота (заглушка)
     */
    saveScreenshot() {
        this.showNotification('Функция сохранения скриншота будет добавлена позже', 'info');
    }

    /**
     * Скрытие всех панелей
     */
    hideAllPanels() {
        const helpPanel = document.getElementById('help-panel');
        if (helpPanel) {
            helpPanel.style.display = 'none';
        }
    }

    /**
     * Обработка изменения размера окна
     */
    onWindowResize() {
        // Здесь можно добавить логику адаптации UI при изменении размера окна
        console.log('Window resized');
    }

    /**
     * Добавление кнопки в UI
     * @param {string} text - Текст кнопки
     * @param {Function} callback - Функция обратного вызова
     * @param {string} container - ID контейнера для кнопки
     * @returns {HTMLElement} Созданная кнопка
     */
    addButton(text, callback, container = 'ui-overlay') {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            background: rgba(0, 255, 255, 0.8);
            color: black;
            border: none;
            padding: 10px 15px;
            margin: 5px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('click', callback);
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(0, 255, 255, 1)';
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(0, 255, 255, 0.8)';
            button.style.transform = 'scale(1)';
        });
        
        const containerElement = document.getElementById(container);
        if (containerElement) {
            containerElement.appendChild(button);
        }
        
        return button;
    }

    /**
     * Получить элемент UI по ID
     * @param {string} id - ID элемента
     * @returns {HTMLElement|null} Элемент или null
     */
    getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Установить видимость элемента
     * @param {string} id - ID элемента
     * @param {boolean} visible - Видимость
     */
    setElementVisible(id, visible) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    }
} 