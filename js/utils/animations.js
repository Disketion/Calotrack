// js/utils/animations.js

class Animations {
    /**
     * Плавное появление элемента
     */
    static fadeIn(element, duration = 300) {
        if (!element) return;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            element.style.opacity = Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Плавное скрытие элемента
     */
    static fadeOut(element, duration = 300) {
        if (!element) return Promise.resolve();
        
        return new Promise((resolve) => {
            let start = null;
            const startOpacity = parseFloat(getComputedStyle(element).opacity) || 1;
            
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = (timestamp - start) / duration;
                element.style.opacity = startOpacity * (1 - Math.min(progress, 1));
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    /**
     * Анимация появления сдвигом вверх
     */
    static slideUp(element, duration = 400) {
        if (!element) return;
        element.style.transform = 'translateY(20px)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            element.style.transform = `translateY(${20 * (1 - progress)}px)`;
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Показать скелетон загрузки
     */
    static showLoading(container, count = 3) {
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton skeleton-card';
            skeleton.style.cssText = `
                height: 280px;
                border-radius: 16px;
                margin-bottom: 20px;
                background: linear-gradient(90deg, var(--border-color) 25%, var(--bg-color) 50%, var(--border-color) 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            `;
            container.appendChild(skeleton);
        }
    }

    /**
     * Скрыть скелетон загрузки
     */
    static hideLoading(container) {
        if (!container) return;
        const skeletons = container.querySelectorAll('.skeleton-card');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    /**
     * Анимация "пульсации" для кнопки
     */
    static pulse(element, duration = 300) {
        if (!element) return;
        element.classList.add('pulse-once');
        setTimeout(() => {
            element.classList.remove('pulse-once');
        }, duration);
    }

    /**
     * Анимация "тряски" для ошибки
     */
    static shake(element, duration = 500) {
        if (!element) return;
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, duration);
    }

    /**
     * Плавная прокрутка к элементу
     */
    static scrollTo(element, offset = 0) {
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Добавляем необходимые CSS анимации
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    
    .skeleton-card {
        animation: shimmer 1.5s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse-once {
        animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(animationStyles);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Animations;
}