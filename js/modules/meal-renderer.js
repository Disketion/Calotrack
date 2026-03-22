class MealRenderer {
    constructor() {
        this.currentCategory = 'breakfast';
        this.currentMenu = null;
        this.currentHealthProfile = null;
    }

    /**
     * Отрисовка всего меню
     */
    renderMenu(menuData, healthProfile) {
        this.currentMenu = menuData;
        this.currentHealthProfile = healthProfile;
        
        const container = document.getElementById('meal-content');
        if (!container) return;
        
        // Проверяем, что menuData существует
        if (!menuData || !menuData.meals) {
            container.innerHTML = `
                <div class="meal-empty">
                    <p>😔 Ошибка: не удалось загрузить меню</p>
                    <p>Попробуйте сгенерировать снова</p>
                </div>
            `;
            return;
        }
        
        const tabsHtml = this.renderTabs();
        const mealsHtml = this.renderMealGrid(this.currentCategory);
        
        container.innerHTML = `
            ${tabsHtml}
            <div class="meal-grid-container">
                ${mealsHtml}
            </div>
            <div class="meal-actions">
                <button class="refresh-meal-btn" id="refresh-meal">
                    🔄 Другой вариант
                </button>
                <button class="save-menu-btn" id="save-menu">
                    💾 Сохранить меню
                </button>
            </div>
        `;
        
        this.setupTabListeners();
        this.setupActionListeners();
    }
    
    /**
     * Отрисовка табов
     */
    renderTabs() {
        const categories = [
            { id: 'breakfast', name: '🌅 Завтрак', percent: 30 },
            { id: 'snack', name: '🍎 Перекус', percent: 10 },
            { id: 'lunch', name: '🌞 Обед', percent: 35 },
            { id: 'dinner', name: '🌙 Ужин', percent: 25 }
        ];
        
        return `
            <div class="meal-tabs">
                ${categories.map(cat => `
                    <button class="tab-btn ${this.currentCategory === cat.id ? 'active' : ''}" 
                            data-category="${cat.id}">
                        ${cat.name}
                        <span class="tab-percent">${cat.percent}%</span>
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Отрисовка сетки блюд
     */
    renderMealGrid(category) {
        const meal = this.currentMenu?.meals?.[category];
        if (!meal) {
            return `
                <div class="meal-empty">
                    <p>😔 Нет подходящих блюд для этой категории</p>
                </div>
            `;
        }
        
        return `
            <div class="meal-grid">
                ${this.renderMealCard(meal, category)}
            </div>
        `;
    }
    
    /**
     * Отрисовка карточки блюда с CSS-заглушкой
     */
    renderMealCard(meal, category) {
        const multiplier = meal.multiplier || 1;
        const isModified = multiplier !== 1;
        const note = meal.note;
        
        // Генерируем цвет для иконки на основе названия блюда
        const iconColor = this.getColorFromName(meal.name);
        const iconEmoji = this.getEmojiForMeal(category);
        const hasImage = meal.image && meal.image !== '';
        
        return `
            <div class="meal-card" data-meal-id="${meal.id}" data-category="${category}">
                <div class="meal-card-image-wrapper">
                    ${hasImage ? `
                        <img src="${meal.image}" 
                             alt="${meal.name}" 
                             class="meal-card-image"
                             onerror="this.style.display='none'; this.parentElement.querySelector('.meal-placeholder').style.display='flex';">
                        <div class="meal-placeholder" style="display: none;">
                            <div class="meal-placeholder-content">
                                <div class="placeholder-icon" style="background: ${iconColor}20;">
                                    <span class="placeholder-emoji">${iconEmoji}</span>
                                </div>
                                <div class="placeholder-title">${meal.name}</div>
                                <div class="placeholder-text">Фото скоро появится</div>
                            </div>
                        </div>
                    ` : `
                        <div class="meal-placeholder" style="display: flex;">
                            <div class="meal-placeholder-content">
                                <div class="placeholder-icon" style="background: ${iconColor}20;">
                                    <span class="placeholder-emoji">${iconEmoji}</span>
                                </div>
                                <div class="placeholder-title">${meal.name}</div>
                                <div class="placeholder-text">Фото скоро появится</div>
                            </div>
                        </div>
                    `}
                </div>
                <div class="meal-card-content">
                    <h4>${meal.name}</h4>
                    
                    ${isModified ? `
                        <div class="meal-modified-badge">
                            ⚡ Порция скорректирована (${Math.round(multiplier * 100)}%)
                        </div>
                    ` : ''}
                    
                    <div class="meal-stats">
                        <div class="meal-stat">
                            🔥 <strong>${meal.adjustedCalories}</strong> ккал
                            ${isModified ? `<span class="meal-original">(${meal.originalCalories})</span>` : ''}
                        </div>
                        <div class="meal-stat">
                            🥩 <strong>${Math.round(meal.protein * multiplier)}</strong> г
                        </div>
                        <div class="meal-stat">
                            🥑 <strong>${Math.round(meal.fat * multiplier)}</strong> г
                        </div>
                        <div class="meal-stat">
                            🍚 <strong>${Math.round(meal.carbs * multiplier)}</strong> г
                        </div>
                    </div>
                    
                    ${note ? `
                        <div class="meal-note">
                            💡 ${note}
                        </div>
                    ` : ''}
                    
                    <div class="meal-info">
                        <span class="meal-time">⏱️ ${meal.preparationTime || 15} мин</span>
                        <span class="meal-difficulty">${meal.difficulty || 'Легко'}</span>
                        <button class="meal-details-btn" data-meal-id="${meal.id}">
                            📖 Подробнее
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Получить цвет для иконки на основе названия блюда
     */
    getColorFromName(name) {
        const colors = {
            'овсянк': '#4caf50',
            'омлет': '#ff9800',
            'творог': '#2196f3',
            'гречн': '#795548',
            'курин': '#8bc34a',
            'рыб': '#00bcd4',
            'индейк': '#ff5722',
            'салат': '#cddc39',
            'семг': '#e91e63',
            'тофу': '#9c27b0',
            'йогурт': '#ffc107',
            'яблок': '#f44336',
            'протеин': '#3f51b5'
        };
        
        const lowerName = name.toLowerCase();
        for (const [key, color] of Object.entries(colors)) {
            if (lowerName.includes(key)) {
                return color;
            }
        }
        return '#4caf50';
    }
    
    /**
     * Получить эмодзи для категории блюда
     */
    getEmojiForMeal(category) {
        const emojis = {
            breakfast: '🍳',
            lunch: '🍲',
            dinner: '🌙',
            snack: '🍎'
        };
        return emojis[category] || '🍽️';
    }
    
    /**
     * Настройка обработчиков табов
     */
    setupTabListeners() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = tab.dataset.category;
                if (category && category !== this.currentCategory) {
                    this.currentCategory = category;
                    this.renderMenu(this.currentMenu, this.currentHealthProfile);
                }
            });
        });
    }
    
    /**
     * Настройка обработчиков действий
     */
    setupActionListeners() {
        // Кнопка "Подробнее"
        const detailBtns = document.querySelectorAll('.meal-details-btn');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const mealId = btn.dataset.mealId;
                const meal = this.findMealById(mealId);
                if (meal) {
                    this.showMealDetails(meal);
                }
            });
        });
        
        // Кнопка "Другой вариант"
        const refreshBtn = document.getElementById('refresh-meal');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.handleRefreshMeal();
            });
        }
        
        // Кнопка "Сохранить меню"
        const saveBtn = document.getElementById('save-menu');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleSaveMenu();
            });
        }
    }
    
    /**
     * Поиск блюда по ID
     */
    findMealById(mealId) {
        for (const category of Object.keys(this.currentMenu?.meals || {})) {
            const meal = this.currentMenu.meals[category];
            if (meal && meal.id === mealId) {
                return { ...meal, category };
            }
        }
        return null;
    }
    
    /**
     * Показ деталей блюда с CSS-заглушкой
     */
    showMealDetails(meal) {
        const multiplier = meal.multiplier || 1;
        const iconColor = this.getColorFromName(meal.name);
        const iconEmoji = this.getEmojiForMeal(meal.category);
        const hasImage = meal.image && meal.image !== '';
        
        const modalHtml = `
            <div class="meal-detail-modal" id="meal-detail-modal">
                <div class="meal-detail-content">
                    <button class="close-detail" id="close-detail">✖</button>
                    
                    <div class="meal-detail-image-wrapper">
                        ${hasImage ? `
                            <img src="${meal.image}" 
                                 alt="${meal.name}" 
                                 class="meal-detail-image"
                                 onerror="this.style.display='none'; this.parentElement.querySelector('.meal-detail-placeholder').style.display='flex';">
                            <div class="meal-detail-placeholder" style="display: none;">
                                <div class="meal-detail-placeholder-content">
                                    <div class="detail-placeholder-icon" style="background: ${iconColor}20;">
                                        <span class="detail-placeholder-emoji">${iconEmoji}</span>
                                    </div>
                                    <div class="detail-placeholder-title">${meal.name}</div>
                                    <div class="detail-placeholder-text">Изображение временно отсутствует</div>
                                </div>
                            </div>
                        ` : `
                            <div class="meal-detail-placeholder" style="display: flex;">
                                <div class="meal-detail-placeholder-content">
                                    <div class="detail-placeholder-icon" style="background: ${iconColor}20;">
                                        <span class="detail-placeholder-emoji">${iconEmoji}</span>
                                    </div>
                                    <div class="detail-placeholder-title">${meal.name}</div>
                                    <div class="detail-placeholder-text">Изображение временно отсутствует</div>
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <h2>${meal.name}</h2>
                    
                    <div class="meal-stats">
                        <div class="meal-stat">🔥 ${meal.adjustedCalories} ккал</div>
                        <div class="meal-stat">🥩 ${Math.round(meal.protein * multiplier)} г</div>
                        <div class="meal-stat">🥑 ${Math.round(meal.fat * multiplier)} г</div>
                        <div class="meal-stat">🍚 ${Math.round(meal.carbs * multiplier)} г</div>
                    </div>
                    
                    <div class="meal-detail-ingredients">
                        <strong>📝 Ингредиенты:</strong>
                        <ul>
                            ${(meal.ingredients || []).map(ing => `<li>${ing}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${meal.note ? `
                        <div class="meal-note">
                            💡 <strong>Рекомендация:</strong> ${meal.note}
                        </div>
                    ` : ''}
                    
                    <div class="meal-detail-info">
                        <p>⏱️ Время приготовления: ${meal.preparationTime || 15} минут</p>
                        <p>📊 Сложность: ${meal.difficulty || 'Легко'}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Удаляем старый модал если есть
        const oldModal = document.getElementById('meal-detail-modal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('meal-detail-modal');
        const closeBtn = document.getElementById('close-detail');
        
        setTimeout(() => modal.classList.add('active'), 10);
        
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    /**
     * Обработка обновления блюда
     */
    handleRefreshMeal() {
        const event = new CustomEvent('refreshMeal', {
            detail: {
                category: this.currentCategory,
                currentMealId: this.currentMenu?.meals[this.currentCategory]?.id
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Обработка сохранения меню
     */
    handleSaveMenu() {
        const event = new CustomEvent('saveMenu', {
            detail: {
                menu: this.currentMenu
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Обновление конкретной категории
     */
    updateCategory(category, newMeal) {
        if (this.currentMenu && this.currentMenu.meals) {
            this.currentMenu.meals[category] = newMeal;
            if (this.currentCategory === category) {
                this.renderMenu(this.currentMenu, this.currentHealthProfile);
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealRenderer;
}
