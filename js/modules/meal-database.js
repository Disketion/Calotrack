// public/js/modules/meal-database.js - исправленная версия

class MealDatabase {
    constructor() {
        this.meals = null;
        this.categories = null;
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    async init() {
        if (this.isLoaded) return true;
        if (this.loadingPromise) return this.loadingPromise;
        
        this.loadingPromise = this.loadDatabase();
        return this.loadingPromise;
    }

    async loadDatabase() {
        try {
            // Проверяем кэш
            const cached = localStorage.getItem('mealDatabase');
            if (cached) {
                const data = JSON.parse(cached);
                if (data.version === '1.0.0') {
                    this.meals = data.meals;
                    this.categories = data.categories;
                    this.isLoaded = true;
                    console.log('База меню загружена из кэша');
                    return true;
                }
            }

            // Загружаем JSON файлы
            const mealsResponse = await fetch('data/meals.json');
            if (!mealsResponse.ok) throw new Error('Не удалось загрузить meals.json');
            const mealsData = await mealsResponse.json();
            
            // Проверяем структуру - если данные обернуты в объект с полями breakfast/lunch и т.д.
            if (mealsData.breakfast || mealsData.lunch || mealsData.dinner || mealsData.snack) {
                this.meals = mealsData;
            } else {
                // Если структура другая, создаем правильную
                console.warn('Неожиданная структура JSON, создаем стандартную');
                this.meals = {
                    breakfast: mealsData.breakfast || [],
                    lunch: mealsData.lunch || [],
                    dinner: mealsData.dinner || [],
                    snack: mealsData.snack || []
                };
            }

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

    async loadFallbackDatabase() {
        try {
            // Встроенные данные на случай ошибки
            this.meals = {
                breakfast: [
                    {
                        "id": "breakfast_fallback_001",
                        "name": "Овсяная каша с фруктами",
                        "image": "img/meals/breakfast/oatmeal-berries.jpg",
                        "calories": 350,
                        "protein": 12,
                        "fat": 10,
                        "carbs": 52,
                        "fiber": 6,
                        "ingredients": ["овсянка 50г", "молоко 150мл", "банан 1/2 шт", "мед 5г"],
                        "preparationTime": 10,
                        "difficulty": "Легко",
                        "healthProfiles": {
                            "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                            "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                            "normal": { "recommended": true, "portionMultiplier": 1.0 },
                            "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                        }
                    }
                ],
                lunch: [
                    {
                        "id": "lunch_fallback_001",
                        "name": "Куриная грудка с рисом",
                        "image": "img/meals/lunch/chicken-rice.jpg",
                        "calories": 500,
                        "protein": 38,
                        "fat": 12,
                        "carbs": 58,
                        "fiber": 4,
                        "ingredients": ["куриная грудка 150г", "рис 80г", "овощи 150г", "масло 5г"],
                        "preparationTime": 30,
                        "difficulty": "Средне",
                        "healthProfiles": {
                            "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                            "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                            "normal": { "recommended": true, "portionMultiplier": 1.0 },
                            "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                        }
                    }
                ],
                dinner: [
                    {
                        "id": "dinner_fallback_001",
                        "name": "Рыба с овощами",
                        "image": "img/meals/dinner/fish-veggies.jpg",
                        "calories": 400,
                        "protein": 35,
                        "fat": 18,
                        "carbs": 22,
                        "fiber": 5,
                        "ingredients": ["филе рыбы 150г", "овощи 200г", "оливковое масло 10г"],
                        "preparationTime": 25,
                        "difficulty": "Средне",
                        "healthProfiles": {
                            "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                            "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                            "normal": { "recommended": true, "portionMultiplier": 1.0 },
                            "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                        }
                    }
                ],
                snack: [
                    {
                        "id": "snack_fallback_001",
                        "name": "Фруктовый перекус",
                        "image": "img/meals/snacks/fruits.jpg",
                        "calories": 120,
                        "protein": 1,
                        "fat": 0.5,
                        "carbs": 28,
                        "fiber": 3,
                        "ingredients": ["яблоко 1 шт", "банан 1/2 шт"],
                        "preparationTime": 2,
                        "difficulty": "Легко",
                        "healthProfiles": {
                            "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                            "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                            "normal": { "recommended": true, "portionMultiplier": 1.0 },
                            "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                        }
                    }
                ]
            };
            
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

    getMealsByCategory(category, healthProfile = null) {
        if (!this.isLoaded || !this.meals) return [];
        
        // Проверяем, что meals[category] существует и является массивом
        const meals = this.meals[category];
        if (!meals || !Array.isArray(meals)) {
            console.warn(`Категория ${category} не найдена или не является массивом`);
            return [];
        }
        
        if (!healthProfile) return meals;
        
        return meals.filter(meal => {
            const profile = meal.healthProfiles?.[healthProfile];
            return profile && profile.recommended !== false;
        });
    }

    getAllMealsForHealthProfile(healthProfile) {
        if (!this.isLoaded || !this.meals) return {};
        
        const result = {};
        for (const category of Object.keys(this.meals)) {
            result[category] = this.getMealsByCategory(category, healthProfile);
        }
        return result;
    }

    getMealById(id) {
        if (!this.isLoaded || !this.meals) return null;
        
        for (const category of Object.keys(this.meals)) {
            const mealsArray = this.meals[category];
            if (Array.isArray(mealsArray)) {
                const meal = mealsArray.find(m => m.id === id);
                if (meal) return { ...meal, category };
            }
        }
        return null;
    }

    getCategoryInfo(category) {
        return this.categories?.categories?.[category] || {
            name: category,
            caloriePercent: 25,
            icon: '🍽️'
        };
    }

    getAllCategories() {
        if (!this.meals) return ['breakfast', 'lunch', 'dinner', 'snack'];
        return Object.keys(this.meals).filter(key => Array.isArray(this.meals[key]));
    }

    isReady() {
        return this.isLoaded && this.meals !== null;
    }
}

window.MealDatabase = MealDatabase;
