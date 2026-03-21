// theme-manager.js
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        this.addSystemThemeListener();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.currentTheme = theme;
        
        // Обновляем цвет meta theme-color для мобильных браузеров
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#4caf50');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Анимация переключения
        document.documentElement.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 500);

        this.showThemeNotification(newTheme);
    }

    createThemeToggle() {
        // Удаляем старую кнопку если есть
        const oldToggle = document.querySelector('.theme-toggle');
        if (oldToggle) oldToggle.remove();

        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Переключить тему');
        toggle.setAttribute('title', 'Переключить тему');
        
        toggle.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(toggle);
    }

    addSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });

            // Применяем системную тему если нет сохраненной
            if (!localStorage.getItem('theme')) {
                this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        }
    }

    showThemeNotification(theme) {
        // Удаляем старые уведомления
        const oldNotifications = document.querySelectorAll('.theme-notification');
        oldNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `theme-notification ${theme === 'dark' ? 'success' : 'info'}`;
        notification.innerHTML = `
            <strong>${theme === 'dark' ? '🌙' : '☀️'} Тема изменена</strong>
            <p>${theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена'}</p>
        `;

        document.body.appendChild(notification);

        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            const toggleRect = toggleBtn.getBoundingClientRect();
            notification.style.top = `${toggleRect.bottom + 10}px`;
            notification.style.right = `${window.innerWidth - toggleRect.right}px`;
        }

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});