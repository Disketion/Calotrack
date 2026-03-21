// public/js/modules/meal-modal.js - ПОЛНОСТЬЮ ПЕРЕПИСАНА

class MealModal {
    constructor(renderer) {
        this.renderer = renderer;
        this.modal = null;
        this.isOpen = false;
        this.currentMenu = null;
    }
    
    show(menuData, userData) {
        this.currentMenu = menuData;
        
        if (!this.modal) {
            this.createModal();
        }
        
        this.fillModalContent(menuData, userData);
        
        this.modal.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.animateIn();
    }
    
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
        
        const closeBtn = document.getElementById('close-modal-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }
        
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.hide();
            });
        }
        
        document.addEventListener('refreshMeal', (e) => {
            this.handleRefreshMeal(e.detail);
        });
        
        document.addEventListener('saveMenu', (e) => {
            this.handleSaveMenu(e.detail);
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }
    
    fillModalContent(menuData, userData) {
        const healthBadge = document.getElementById('health-badge');
        if (!healthBadge) return;
        
        // Получаем данные с защитой от undefined
        const healthProfileValue = menuData ? menuData.healthProfile : 'normal';
        const totalCaloriesValue = menuData ? menuData.totalCalories : 0;
        const generatedCaloriesValue = menuData ? menuData.generatedCalories : 0;
        const calorieDifferenceValue = menuData ? menuData.calorieDifference : 0;
        
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
        
        const bmiValue = userData && userData.bmi ? userData.bmi.toFixed(1) : '?';
        const goalValue = userData && userData.goal ? goalNames[userData.goal] || userData.goal : '?';
        
        healthBadge.innerHTML = `
            <h3>🏥 Ваш профиль: ${profileNames[healthProfileValue] || healthProfileValue}</h3>
            <p>📊 ИМТ: ${bmiValue} | 🎯 Цель: ${goalValue}</p>
            <p>🔥 Суточная норма: ${totalCaloriesValue} ккал | 🍽️ Сгенерировано: ${generatedCaloriesValue} ккал</p>
            ${calorieDifferenceValue !== 0 ? `
                <div class="special-diet">
                    ${calorieDifferenceValue > 0 ? '➕' : '➖'} 
                    Разница: ${Math.abs(calorieDifferenceValue)} ккал
                </div>
            ` : ''}
        `;
        
        if (this.renderer && menuData) {
            this.renderer.renderMenu(menuData, healthProfileValue);
        } else if (this.renderer) {
            // Если нет menuData, создаем пустое меню
            this.renderer.renderMenu({ meals: {} }, 'normal');
        }
    }
    
    hide() {
        if (!this.modal) return;
        
        this.modal.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
        
        setTimeout(() => {
            if (this.modal && !this.isOpen) {
                const content = document.getElementById('meal-content');
                if (content) content.innerHTML = '';
            }
        }, 300);
    }
    
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
        
        if (this.modal) {
            this.modal.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }
    
    animateIn() {
        const container = this.modal ? this.modal.querySelector('.modal-container') : null;
        if (container) {
            container.style.transform = 'scale(0.95)';
            setTimeout(() => {
                container.style.transform = 'scale(1)';
            }, 10);
        }
    }
    
    handleRefreshMeal(detail) {
        const category = detail ? detail.category : null;
        const currentMealId = detail ? detail.currentMealId : null;
        
        const refreshEvent = new CustomEvent('requestMealRefresh', {
            detail: {
                category: category,
                currentMealId: currentMealId,
                menuData: this.currentMenu
            }
        });
        document.dispatchEvent(refreshEvent);
    }
    
    handleSaveMenu(detail) {
        const menu = detail ? detail.menu : null;
        if (!menu) return;
        
        const savedMenus = JSON.parse(localStorage.getItem('savedMenus') || '[]');
        savedMenus.unshift({
            id: Date.now(),
            date: new Date().toISOString(),
            menu: menu
        });
        
        if (savedMenus.length > 10) savedMenus.pop();
        localStorage.setItem('savedMenus', JSON.stringify(savedMenus));
        
        this.showNotification('✅ Меню сохранено в историю!');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'theme-notification success';
        notification.innerHTML = `<strong>${message}</strong>`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card-bg);
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-hover);
            z-index: 2100;
            animation: slideIn 0.5s ease-out;
            border-left: 4px solid var(--primary-color);
            top: auto;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

window.MealModal = MealModal;
