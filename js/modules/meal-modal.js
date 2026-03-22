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
        
        let profileName = 'Нормальный вес';
        let profileIcon = '✅';
        
        if (menuData && menuData.healthProfile) {
            const profile = menuData.healthProfile;
            if (profile === 'obesity') {
                profileName = 'Ожирение';
                profileIcon = '⚠️';
            } else if (profile === 'overweight') {
                profileName = 'Избыточный вес';
                profileIcon = '📊';
            } else if (profile === 'normal') {
                profileName = 'Нормальный вес';
                profileIcon = '✅';
            } else if (profile === 'underweight') {
                profileName = 'Дефицит веса';
                profileIcon = '⚡';
            }
        }
        
        let goalName = 'Поддержание веса';
        if (userData && userData.goal) {
            if (userData.goal === 'lose') goalName = 'Похудение';
            else if (userData.goal === 'gain') goalName = 'Набор массы';
            else goalName = 'Поддержание веса';
        }
        
        const bmiValue = (userData && userData.bmi) ? userData.bmi.toFixed(1) : '?';
        const totalCalories = (menuData && menuData.totalCalories) ? menuData.totalCalories : 0;
        const generatedCalories = (menuData && menuData.generatedCalories) ? menuData.generatedCalories : 0;
        const calorieDiff = (menuData && menuData.calorieDifference) ? menuData.calorieDifference : 0;
        
        healthBadge.innerHTML = `
            <h3>${profileIcon} Ваш профиль: ${profileName}</h3>
            <p>📊 ИМТ: ${bmiValue} | 🎯 Цель: ${goalName}</p>
            <p>🔥 Суточная норма: ${totalCalories} ккал | 🍽️ Сгенерировано: ${generatedCalories} ккал</p>
            ${calorieDiff !== 0 ? `
                <div class="special-diet">
                    ${calorieDiff > 0 ? '➕' : '➖'} 
                    Разница: ${Math.abs(calorieDiff)} ккал
                </div>
            ` : ''}
        `;
        
        if (this.renderer && menuData) {
            const healthProfileValue = menuData.healthProfile || 'normal';
            this.renderer.renderMenu(menuData, healthProfileValue);
        } else if (this.renderer) {
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
        
        this.showNotification('Меню сохранено в историю!');
    }
    
    showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification success';
        toast.innerHTML = `
            <div class="toast-icon">✅</div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--text-color);
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        border-left: 4px solid var(--primary-color);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        backdrop-filter: blur(10px);
    }
    
    .toast-notification.show {
        transform: translateX(0);
    }
    
    .toast-notification.success {
        border-left-color: #4caf50;
    }
    
    .toast-notification.error {
        border-left-color: #e53935;
    }
    
    .toast-notification.warning {
        border-left-color: #ff9800;
    }
    
    .toast-notification.info {
        border-left-color: #2196f3;
    }
    
    .toast-icon {
        font-size: 18px;
        flex-shrink: 0;
    }
    
    .toast-message {
        flex: 1;
    }
    
    @media (max-width: 768px) {
        .toast-notification {
            bottom: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            padding: 10px 16px;
        }
    }
`;
document.head.appendChild(toastStyle);

if (typeof window !== 'undefined') {
    window.MealModal = MealModal;
}
