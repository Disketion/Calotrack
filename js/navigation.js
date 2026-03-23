// js/navigation.js - Улучшенная навигация

class Navigation {
    constructor() {
        this.initBreadcrumbs();
        this.initMobileMenu();
        this.initSearch();
        this.initQuickActions();
    }

    /**
     * Хлебные крошки
     */
    initBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;

        const currentPath = window.location.pathname;
        const pageName = this.getPageName(currentPath);
        const pages = [
            { name: 'Главная', url: 'index.html', icon: '🏠' },
            { name: 'Калькулятор', url: 'calculator.html', icon: '🧮' },
            { name: 'Белки', url: 'proteins.html', icon: '🥩' },
            { name: 'Жиры', url: 'fats.html', icon: '🥑' },
            { name: 'Углеводы', url: 'carbs.html', icon: '🍚' },
            { name: 'История', url: 'history.html', icon: '📊' }
        ];

        let breadcrumbHtml = '<div class="breadcrumb-nav">';
        
        // Находим текущую страницу и строим путь
        const currentIndex = pages.findIndex(p => p.url === pageName);
        
        if (currentIndex !== -1) {
            // Добавляем "Главная"
            breadcrumbHtml += `
                <a href="index.html" class="breadcrumb-link">
                    <span>🏠</span> Главная
                </a>
            `;
            
            // Добавляем текущую страницу
            breadcrumbHtml += `
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">
                    ${pages[currentIndex].icon} ${pages[currentIndex].name}
                </span>
            `;
        } else {
            // Если страница не в списке (например, модальное окно)
            breadcrumbHtml += `
                <span class="breadcrumb-current">
                    📄 ${document.title || 'CaloTrack'}
                </span>
            `;
        }
        
        breadcrumbHtml += '</div>';
        breadcrumbContainer.innerHTML = breadcrumbHtml;
    }

    getPageName(path) {
        const fileName = path.split('/').pop();
        return fileName || 'index.html';
    }

    /**
     * Мобильное меню (гамбургер)
     */
    initMobileMenu() {
        // Добавляем кнопку гамбургера только на мобильных
        if (window.innerWidth > 768) return;

        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Создаем кнопку гамбургера
        const hamburger = document.createElement('button');
        hamburger.className = 'hamburger-menu';
        hamburger.setAttribute('aria-label', 'Меню');
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        document.body.insertBefore(hamburger, document.body.firstChild);

        // Добавляем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);

        // Обработчики
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.style.overflow = sidebar.classList.contains('mobile-open') ? 'hidden' : '';
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Закрываем при клике на ссылку
        const links = sidebar.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('mobile-open');
                overlay.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /**
     * Поиск по сайту
     */
    initSearch() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;

        const searchHtml = `
            <div class="search-box">
                <input type="text" 
                       class="search-input" 
                       placeholder="🔍 Поиск блюд, продуктов, статей..."
                       id="global-search">
                <div class="search-results" id="search-results"></div>
            </div>
        `;
        
        searchContainer.innerHTML = searchHtml;
        
        const searchInput = document.getElementById('global-search');
        const searchResults = document.getElementById('search-results');
        
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.remove('active');
                return;
            }
            
            debounceTimer = setTimeout(() => {
                this.performSearch(query, searchResults);
            }, 300);
        });
        
        // Закрываем результаты при клике вне
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }

    async performSearch(query, resultsContainer) {
        // Собираем данные для поиска
        const searchData = await this.getSearchData();
        
        const results = searchData.filter(item => {
            const searchString = `${item.name} ${item.category} ${item.tags?.join(' ')}`.toLowerCase();
            return searchString.includes(query.toLowerCase());
        }).slice(0, 10); // Максимум 10 результатов
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result-empty">
                    😔 Ничего не найдено для "${query}"
                </div>
            `;
        } else {
            resultsContainer.innerHTML = results.map(result => `
                <a href="${result.url}" class="search-result-item">
                    <span class="result-icon">${result.icon}</span>
                    <div class="result-info">
                        <div class="result-name">${result.name}</div>
                        <div class="result-category">${result.category}</div>
                    </div>
                </a>
            `).join('');
        }
        
        resultsContainer.classList.add('active');
    }

    async getSearchData() {
        // Кэшируем данные для поиска
        if (window.searchCache) return window.searchCache;
        
        const data = [];
        
        // Страницы
        const pages = [
            { name: 'Калькулятор калорий', category: 'Страница', icon: '🧮', url: 'calculator.html' },
            { name: 'Белки', category: 'Нутриенты', icon: '🥩', url: 'proteins.html' },
            { name: 'Жиры', category: 'Нутриенты', icon: '🥑', url: 'fats.html' },
            { name: 'Углеводы', category: 'Нутриенты', icon: '🍚', url: 'carbs.html' },
            { name: 'История расчетов', category: 'Страница', icon: '📊', url: 'history.html' }
        ];
        
        data.push(...pages);
        
        // Продукты (из текущей страницы)
        const products = document.querySelectorAll('.product-button');
        products.forEach(product => {
            const name = product.querySelector('span')?.innerText;
            const tooltip = product.querySelector('.product-tooltip')?.innerText;
            if (name) {
                data.push({
                    name,
                    category: 'Продукт',
                    icon: '🍽️',
                    url: '#',
                    tags: [tooltip]
                });
            }
        });
        
        window.searchCache = data;
        return data;
    }

    /**
     * Быстрые действия
     */
    initQuickActions() {
        const quickActionsContainer = document.querySelector('.quick-actions');
        if (!quickActionsContainer) return;
        
        // Проверяем, на какой странице находимся
        const isCalculator = window.location.pathname.includes('calculator.html');
        
        const actions = [
            { 
                icon: '⚡', 
                name: 'Быстрый расчет', 
                action: () => {
                    if (isCalculator) {
                        document.getElementById('calorie-form')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        window.location.href = 'calculator.html';
                    }
                }
            },
            { 
                icon: '🍽️', 
                name: 'Случайное меню', 
                action: () => {
                    if (isCalculator) {
                        document.getElementById('show-menu-btn')?.click();
                    } else {
                        window.location.href = 'calculator.html';
                    }
                }
            },
            { 
                icon: '💾', 
                name: 'Сохраненные', 
                action: () => {
                    this.showSavedMenus();
                }
            },
            { 
                icon: '📤', 
                name: 'Поделиться', 
                action: () => {
                    this.shareResults();
                }
            }
        ];
        
        quickActionsContainer.innerHTML = `
            <div class="quick-actions-title">⚡ Быстрые действия</div>
            <div class="quick-actions-buttons">
                ${actions.map(action => `
                    <button class="quick-action-btn" data-action="${action.name}">
                        ${action.icon} ${action.name}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Добавляем обработчики
        const buttons = quickActionsContainer.querySelectorAll('.quick-action-btn');
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', actions[index].action);
        });
    }

    showSavedMenus() {
        const savedMenus = JSON.parse(localStorage.getItem('savedMenus') || '[]');
        
        if (savedMenus.length === 0) {
            this.showNotification('Нет сохраненных меню', 'info');
            return;
        }
        
        const modalHtml = `
            <div class="saved-menus-modal" id="saved-menus-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>💾 Сохраненные меню</h3>
                        <button class="close-modal-btn">✖</button>
                    </div>
                    <div class="modal-body">
                        ${savedMenus.map(menu => `
                            <div class="saved-menu-item">
                                <div class="saved-menu-date">📅 ${new Date(menu.date).toLocaleDateString()}</div>
                                <div class="saved-menu-calories">🔥 ${menu.menu.totalCalories} ккал</div>
                                <button class="load-menu-btn" data-menu='${JSON.stringify(menu.menu)}'>
                                    Загрузить
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        const modal = document.getElementById('saved-menus-modal');
        const closeBtn = modal.querySelector('.close-modal-btn');
        
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        modal.classList.add('active');
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Загрузка меню
        modal.querySelectorAll('.load-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const menu = JSON.parse(btn.dataset.menu);
                // Триггерим событие для отображения меню
                const event = new CustomEvent('loadSavedMenu', { detail: menu });
                document.dispatchEvent(event);
                closeModal();
                // Перенаправляем на калькулятор
                if (!window.location.pathname.includes('calculator.html')) {
                    window.location.href = 'calculator.html';
                }
            });
        });
    }

    shareResults() {
        const resultEl = document.getElementById('result');
        if (!resultEl || resultEl.innerText.includes('Здесь появится')) {
            this.showNotification('Сначала выполните расчет', 'warning');
            return;
        }
        
        const resultText = resultEl.innerText;
        
        if (navigator.share) {
            navigator.share({
                title: 'Мои результаты CaloTrack',
                text: resultText,
                url: window.location.href
            }).catch(() => {
                this.copyToClipboard(resultText);
            });
        } else {
            this.copyToClipboard(resultText);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Результаты скопированы!', 'success');
        }).catch(() => {
            this.showNotification('Не удалось скопировать', 'error');
        });
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</div>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});
