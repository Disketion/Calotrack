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

        const notification = document.createElement('div');
        notification.className = `toast-notification ${theme === 'dark' ? 'success' : 'info'}`;
        notification.innerHTML = `
            <div class="toast-icon">${theme === 'dark' ? '🌙' : '☀️'}</div>
            <div class="toast-message">${theme === 'dark' ? 'Тёмная тема включена' : 'Светлая тема включена'}</div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
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

document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
});
