// js/modules/meal-database.js

class MealDatabase {
    constructor() {
        this.meals = null;
        this.categories = null;
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Инициализация базы данных
     */
    async init() {
        if (this.isLoaded) return true;
        if (this.loadingPromise) return this.loadingPromise;
        
        this.loadingPromise = this.loadDatabase();
        return this.loadingPromise;
    }

    /**
     * Загрузка базы данных
     */
    async loadDatabase() {
        try {
            // Пытаемся загрузить из localStorage
            const cached = localStorage.getItem('mealDatabase');
            if (cached) {
                const data = JSON.parse(cached);
                if (data.version === '1.0.0' && Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    this.meals = data.meals;
                    this.categories = data.categories;
                    this.isLoaded = true;
                    console.log('База меню загружена из кэша');
                    return true;
                }
            }

            // Загружаем основную базу
            const mealsResponse = await fetch('data/meals.json');
            if (!mealsResponse.ok) throw new Error('Не удалось загрузить meals.json');
            this.meals = await mealsResponse.json();

            // Загружаем категории
            const categoriesResponse = await fetch('data/categories.json');
            if (!categoriesResponse.ok) throw new Error('Не удалось загрузить categories.json');
            this.categories = await categoriesResponse.json();

            // Сохраняем в кэш
            localStorage.setItem('mealDatabase', JSON.stringify({
                version: '1.0.0',
                timestamp: Date.now(),
                meals: this.meals,
                categories: this.categories
            }));

            this.isLoaded = true;
            console.log('База меню успешно загружена');
            return true;
        } catch (error) {
            console.error('Ошибка загрузки базы меню:', error);
            return this.loadFallbackDatabase();
        }
    }

    /**
     * Загрузка резервной базы
     */
    async loadFallbackDatabase() {
        try {
            const response = await fetch('data/meals-fallback.json');
            if (!response.ok) throw new Error('Не удалось загрузить fallback базу');
            this.meals = await response.json();
            
            // Создаем дефолтные категории
            this.categories = {
                categories: {
                    breakfast: { name: '🌅 Завтрак', caloriePercent: 30, icon: '🌅' },
                    lunch: { name: '🌞 Обед', caloriePercent: 35, icon: '🌞' },
                    dinner: { name: '🌙 Ужин', caloriePercent: 25, icon: '🌙' },
                    snack: { name: '🍎 Перекус', caloriePercent: 10, icon: '🍎' }
                }
            };
            
            this.isLoaded = true;
            console.warn('Используется резервная база меню');
            return true;
        } catch (fallbackError) {
            console.error('Критическая ошибка: не удалось загрузить ни одну базу меню');
            return false;
        }
    }

    /**
     * Получение блюд по категории
     */
    getMealsByCategory(category, healthProfile = null) {
        if (!this.isLoaded || !this.meals) return [];
        
        const meals = this.meals[category] || [];
        if (!healthProfile) return meals;
        
        // Фильтруем по профилю здоровья
        return meals.filter(meal => {
            const profile = meal.healthProfiles?.[healthProfile];
            return profile && profile.recommended !== false;
        });
    }

    /**
     * Получение всех блюд для профиля здоровья
     */
    getAllMealsForHealthProfile(healthProfile) {
        if (!this.isLoaded || !this.meals) return {};
        
        const result = {};
        for (const category of Object.keys(this.meals)) {
            result[category] = this.getMealsByCategory(category, healthProfile);
        }
        return result;
    }

    /**
     * Получение блюда по ID
     */
    getMealById(id) {
        if (!this.isLoaded || !this.meals) return null;
        
        for (const category of Object.keys(this.meals)) {
            const meal = this.meals[category].find(m => m.id === id);
            if (meal) return { ...meal, category };
        }
        return null;
    }

    /**
     * Получение информации о категории
     */
    getCategoryInfo(category) {
        return this.categories?.categories?.[category] || {
            name: category,
            caloriePercent: 25,
            icon: '🍽️'
        };
    }

    /**
     * Получение всех категорий
     */
    getAllCategories() {
        return Object.keys(this.meals || {});
    }

    /**
     * Проверка готовности базы
     */
    isReady() {
        return this.isLoaded && this.meals !== null;
    }
}

// Экспортируем для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealDatabase;
}