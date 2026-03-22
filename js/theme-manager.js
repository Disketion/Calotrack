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
        
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#4caf50');
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        document.documentElement.style.transition = 'all 0.5s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 500);

        this.showThemeNotification(newTheme);
    }

    createThemeToggle() {
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

            if (!localStorage.getItem('theme')) {
                this.applyTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        }
    }

    showThemeNotification(theme) {
        const oldNotifications = document.querySelectorAll('.theme-notification');
        oldNotifications.forEach(notification => notification.remove());

        const toast = document.createElement('div');
        toast.className = `toast-notification ${theme === 'dark' ? 'success' : 'info'}`;
        toast.innerHTML = `
            <div class="toast-icon">${theme === 'dark' ? '🌙' : '☀️'}</div>
            <div class="toast-message">${theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена'}</div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
