// js/utils/formatters.js

class Formatters {
    /**
     * Форматирование калорий
     */
    static formatCalories(calories) {
        return `${Math.round(calories)} ккал`;
    }

    /**
     * Форматирование граммов
     */
    static formatGrams(grams) {
        return `${Math.round(grams)} г`;
    }

    /**
     * Форматирование времени приготовления
     */
    static formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} мин`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
    }

    /**
     * Форматирование процентов
     */
    static formatPercent(value) {
        return `${Math.round(value)}%`;
    }

    /**
     * Форматирование даты
     */
    static formatDate(date) {
        return new Date(date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Форматирование сложности блюда
     */
    static formatDifficulty(difficulty) {
        const icons = {
            'Легко': '😊',
            'Средне': '🤔',
            'Сложно': '💪'
        };
        return `${icons[difficulty] || '📝'} ${difficulty}`;
    }

    /**
     * Форматирование статистики КБЖУ
     */
    static formatMacros(protein, fat, carbs) {
        return {
            protein: this.formatGrams(protein),
            fat: this.formatGrams(fat),
            carbs: this.formatGrams(carbs)
        };
    }

    /**
     * Получение иконки для профиля здоровья
     */
    static getHealthIcon(profile) {
        const icons = {
            obesity: '⚠️',
            overweight: '📊',
            normal: '✅',
            underweight: '⚡'
        };
        return icons[profile] || '❓';
    }

    /**
     * Получение названия профиля здоровья на русском
     */
    static getHealthName(profile) {
        const names = {
            obesity: 'Ожирение',
            overweight: 'Избыточный вес',
            normal: 'Нормальный вес',
            underweight: 'Дефицит веса'
        };
        return names[profile] || profile;
    }

    /**
     * Получение рекомендации по питанию для профиля
     */
    static getRecommendation(profile, goal) {
        const recommendations = {
            obesity: {
                lose: 'Снижение калорийности, акцент на белок и клетчатку',
                maintain: 'Строгий контроль калорий, исключение простых углеводов',
                gain: 'Не рекомендуется'
            },
            overweight: {
                lose: 'Умеренный дефицит калорий, баланс БЖУ',
                maintain: 'Контроль порций, достаточное количество белка',
                gain: 'Умеренный профицит, качественные продукты'
            },
            normal: {
                lose: 'Небольшой дефицит, сохранение мышечной массы',
                maintain: 'Сбалансированное питание по КБЖУ',
                gain: 'Умеренный профицит, увеличение порций'
            },
            underweight: {
                lose: 'Не рекомендуется',
                maintain: 'Увеличение калорийности, частые приемы пищи',
                gain: 'Высококалорийное питание, акцент на углеводы'
            }
        };
        
        return recommendations[profile]?.[goal] || 'Сбалансированное питание';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Formatters;
}