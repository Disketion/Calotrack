// js/modules/meal-modal.js

class MealModal {
    constructor(renderer) {
        this.renderer = renderer;
        this.modal = null;
        this.isOpen = false;
        this.currentMenu = null;
    }
    
    /**
     * Показать модальное окно с меню
     */
    show(menuData, userData) {
        this.currentMenu = menuData;
        
        // Создаем модальное окно если его нет
        if (!this.modal) {
            this.createModal();
        }
        
        // Заполняем содержимое
        this.fillModalContent(menuData, userData);
        
        // Показываем окно
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        
        // Анимация появления
        this.animateIn();
    }
    
    /**
     * Создание структуры модального окна
     */
    createModal() {
        const modalHtml = `
            <div class="modal-overlay" id="meal-modal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>🍽️ Персональное меню</h2>
                        <button class="close-modal" id="close-modal-btn">✖</button>
                    </div>
                    <div class="modal-body">
                        <div id="health-badge" class="health-badge"></div>
                        <div id="meal-content"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('meal-modal');
        
        // Настройка закрытия
        const closeBtn = document.getElementById('close-modal-btn');
        closeBtn.addEventListener('click', () => this.hide());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hide();
        });
        
        // Слушаем события от рендерера
        document.addEventListener('refreshMeal', (e) => {
            this.handleRefreshMeal(e.detail);
        });
        
        document.addEventListener('saveMenu', (e) => {
            this.handleSaveMenu(e.detail);
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }
    
    /**
     * Заполнение содержимого модального окна
     */
    fillModalContent(menuData, userData) {
        // Заполняем health badge
        const healthBadge = document.getElementById('health-badge');
        if (healthBadge) {
            const healthProfile = menuData.healthProfile;
            const profileNames = {
                obesity: 'Ожирение',
                overweight: 'Избыточный вес',
                normal: 'Нормальный вес',
                underweight: 'Дефицит веса'
            };
            
            const goalNames = {
                lose: 'Похудение',
                maintain: 'Поддержание веса',
                gain: 'Набор массы'
            };
            
            healthBadge.innerHTML = `
                <h3>🏥 Ваш профиль: ${profileNames[healthProfile] || healthProfile}</h3>
                <p>📊 ИМТ: ${userData?.bmi?.toFixed(1) || '?'} | 🎯 Цель: ${goalNames[userData?.goal] || userData?.goal}</p>
                <p>🔥 Суточная норма: ${menuData.totalCalories} ккал | 🍽️ Сгенерировано: ${menuData.generatedCalories} ккал</p>
                ${menuData.calorieDifference !== 0 ? `
                    <div class="special-diet">
                        ${menuData.calorieDifference > 0 ? '➕' : '➖'} 
                        Разница: ${Math.abs(menuData.calorieDifference)} ккал
                    </div>
                ` : ''}
            `;
        }
        
        // Отрисовываем меню через рендерер
        if (this.renderer) {
            this.renderer.renderMenu(menuData, healthProfile);
        }
    }
    
    /**
     * Скрыть модальное окно
     */
    hide() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (this.modal && !this.isOpen) {
                // Очищаем содержимое
                const content = document.getElementById('meal-content');
                if (content) content.innerHTML = '';
            }
        }, 300);
    }
    
    /**
     * Показать загрузку
     */
    showLoading() {
        if (!this.modal) {
            this.createModal();
        }
        
        const content = document.getElementById('meal-content');
        if (content) {
            content.innerHTML = `
                <div class="modal-loading">
                    <div class="skeleton skeleton-text" style="width: 80%; height: 40px; margin: 20px auto;"></div>
                    <div class="skeleton skeleton-text" style="width: 60%; height: 30px; margin: 20px auto;"></div>
                    <div class="skeleton skeleton-card" style="height: 200px; margin: 20px 0;"></div>
                    <div class="skeleton skeleton-card" style="height: 200px; margin: 20px 0;"></div>
                    <p style="text-align: center; margin-top: 20px;">🍳 Составляем персональное меню...</p>
                </div>
            `;
        }
        
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Анимация появления
     */
    animateIn() {
        const container = this.modal?.querySelector('.modal-container');
        if (container) {
            container.style.transform = 'scale(0.95)';
            setTimeout(() => {
                container.style.transform = 'scale(1)';
            }, 10);
        }
    }
    
    /**
     * Обработка обновления блюда
     */
    async handleRefreshMeal(detail) {
        const { category, currentMealId } = detail;
        
        // Отправляем событие для обновления
        const refreshEvent = new CustomEvent('requestMealRefresh', {
            detail: {
                category,
                currentMealId,
                menuData: this.currentMenu
            }
        });
        document.dispatchEvent(refreshEvent);
    }
    
    /**
     * Обработка сохранения меню
     */
    handleSaveMenu(detail) {
        const { menu } = detail;
        
        // Сохраняем в localStorage
        const savedMenus = JSON.parse(localStorage.getItem('savedMenus') || '[]');
        savedMenus.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            menu: menu
        });
        
        // Ограничиваем до 10 сохраненных меню
        if (savedMenus.length > 10) savedMenus.pop();
        
        localStorage.setItem('savedMenus', JSON.stringify(savedMenus));
        
        // Показываем уведомление
        this.showNotification('✅ Меню сохранено в историю!');
    }
    
    /**
     * Показать уведомление
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification success';
        notification.innerHTML = `<strong>${message}</strong>`;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.top = 'auto';
        notification.style.zIndex = '2100';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealModal;
}