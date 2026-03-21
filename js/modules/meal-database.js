class MealDatabase {
    constructor() {
        this.meals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: []
        };
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
                    this.meals = this.normalizeMealsData(data.meals);
                    this.categories = data.categories;
                    this.isLoaded = true;
                    console.log('База меню загружена из кэша');
                    return true;
                }
            }

            // Загружаем JSON файл
            const mealsResponse = await fetch('data/meals.json');
            if (!mealsResponse.ok) throw new Error('Не удалось загрузить meals.json');
            const mealsData = await mealsResponse.json();
            
            // Нормализуем данные - преобразуем в правильную структуру
            this.meals = this.normalizeMealsData(mealsData);

            // Загружаем категории
            try {
                const categoriesResponse = await fetch('data/categories.json');
                if (categoriesResponse.ok) {
                    this.categories = await categoriesResponse.json();
                }
            } catch (e) {
                console.warn('Не удалось загрузить categories.json, используем стандартные');
            }

            // Создаем стандартные категории если не загрузились
            if (!this.categories) {
                this.categories = {
                    categories: {
                        breakfast: { name: '🌅 Завтрак', caloriePercent: 30, icon: '🌅' },
                        lunch: { name: '🌞 Обед', caloriePercent: 35, icon: '🌞' },
                        dinner: { name: '🌙 Ужин', caloriePercent: 25, icon: '🌙' },
                        snack: { name: '🍎 Перекус', caloriePercent: 10, icon: '🍎' }
                    }
                };
            }

            // Сохраняем в кэш
            localStorage.setItem('mealDatabase', JSON.stringify({
                version: '1.0.0',
                timestamp: Date.now(),
                meals: this.meals,
                categories: this.categories
            }));

            this.isLoaded = true;
            console.log('База меню успешно загружена', this.meals);
            return true;
        } catch (error) {
            console.error('Ошибка загрузки базы меню:', error);
            return this.loadFallbackDatabase();
        }
    }

    /**
     * Нормализует данные из JSON в стандартную структуру
     * Принимает разные форматы и преобразует в { breakfast: [], lunch: [], dinner: [], snack: [] }
     */
    normalizeMealsData(data) {
        // Создаем пустую структуру
        const normalized = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: []
        };

        // Если данные уже имеют правильную структуру
        if (data.breakfast && Array.isArray(data.breakfast)) {
            normalized.breakfast = data.breakfast;
        }
        if (data.lunch && Array.isArray(data.lunch)) {
            normalized.lunch = data.lunch;
        }
        if (data.dinner && Array.isArray(data.dinner)) {
            normalized.dinner = data.dinner;
        }
        if (data.snack && Array.isArray(data.snack)) {
            normalized.snack = data.snack;
        }

        // Если данные в другом формате (например, массив с id категорий)
        // Пытаемся определить по наличию поля category
        if (Array.isArray(data)) {
            data.forEach(item => {
                if (item.category === 'breakfast') normalized.breakfast.push(item);
                else if (item.category === 'lunch') normalized.lunch.push(item);
                else if (item.category === 'dinner') normalized.dinner.push(item);
                else if (item.category === 'snack') normalized.snack.push(item);
            });
        }

        // Если какие-то категории пустые, добавляем тестовые данные
        if (normalized.breakfast.length === 0) {
            normalized.breakfast = this.getDefaultBreakfast();
        }
        if (normalized.lunch.length === 0) {
            normalized.lunch = this.getDefaultLunch();
        }
        if (normalized.dinner.length === 0) {
            normalized.dinner = this.getDefaultDinner();
        }
        if (normalized.snack.length === 0) {
            normalized.snack = this.getDefaultSnack();
        }

        return normalized;
    }

    getDefaultBreakfast() {
        return [
            {
                "id": "breakfast_001",
                "name": "Овсянка с ягодами",
                "image": "img/meals/breakfast/oatmeal-berries.jpg",
                "calories": 350,
                "protein": 12,
                "fat": 8,
                "carbs": 58,
                "fiber": 6,
                "ingredients": ["овсяные хлопья 50г", "ягоды 100г", "мед 10г"],
                "preparationTime": 10,
                "difficulty": "Легко",
                "healthProfiles": {
                    "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                    "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                    "normal": { "recommended": true, "portionMultiplier": 1.0 },
                    "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                }
            }
        ];
    }

    getDefaultLunch() {
        return [
            {
                "id": "lunch_001",
                "name": "Куриная грудка с рисом",
                "image": "img/meals/lunch/chicken-rice.jpg",
                "calories": 500,
                "protein": 38,
                "fat": 12,
                "carbs": 58,
                "fiber": 4,
                "ingredients": ["куриная грудка 150г", "рис 80г", "овощи 150г"],
                "preparationTime": 30,
                "difficulty": "Средне",
                "healthProfiles": {
                    "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                    "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                    "normal": { "recommended": true, "portionMultiplier": 1.0 },
                    "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                }
            }
        ];
    }

    getDefaultDinner() {
        return [
            {
                "id": "dinner_001",
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
        ];
    }

    getDefaultSnack() {
        return [
            {
                "id": "snack_001",
                "name": "Яблоко с орехами",
                "image": "img/meals/snacks/apple-nuts.jpg",
                "calories": 150,
                "protein": 3,
                "fat": 8,
                "carbs": 20,
                "fiber": 4,
                "ingredients": ["яблоко 1 шт", "миндаль 15г"],
                "preparationTime": 2,
                "difficulty": "Легко",
                "healthProfiles": {
                    "obesity": { "recommended": true, "portionMultiplier": 0.8 },
                    "overweight": { "recommended": true, "portionMultiplier": 0.9 },
                    "normal": { "recommended": true, "portionMultiplier": 1.0 },
                    "underweight": { "recommended": true, "portionMultiplier": 1.2 }
                }
            }
        ];
    }

    async loadFallbackDatabase() {
        try {
            // Используем встроенные данные
            this.meals = {
                breakfast: this.getDefaultBreakfast(),
                lunch: this.getDefaultLunch(),
                dinner: this.getDefaultDinner(),
                snack: this.getDefaultSnack()
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
        // Защита от ошибок
        if (!this.isLoaded || !this.meals) {
            console.warn('База данных не загружена');
            return [];
        }
        
        // Получаем массив блюд для категории
        const meals = this.meals[category];
        
        // Проверяем, что meals существует и является массивом
        if (!meals || !Array.isArray(meals)) {
            console.warn(`Категория "${category}" не найдена или не является массивом`, meals);
            return [];
        }
        
        if (!healthProfile) return meals;
        
        // Фильтруем по профилю здоровья
        return meals.filter(meal => {
            if (!meal.healthProfiles) return false;
            const profile = meal.healthProfiles[healthProfile];
            return profile && profile.recommended !== false;
        });
    }

    getAllMealsForHealthProfile(healthProfile) {
        if (!this.isLoaded || !this.meals) return {};
        
        const result = {};
        const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        for (const category of categories) {
            result[category] = this.getMealsByCategory(category, healthProfile);
        }
        return result;
    }

    getMealById(id) {
        if (!this.isLoaded || !this.meals) return null;
        
        const categories = ['breakfast', 'lunch', 'dinner', 'snack'];
        
        for (const category of categories) {
            const mealsArray = this.meals[category];
            if (mealsArray && Array.isArray(mealsArray)) {
                const meal = mealsArray.find(m => m.id === id);
                if (meal) return { ...meal, category };
            }
        }
        return null;
    }

    getCategoryInfo(category) {
        return this.categories?.categories?.[category] || {
            name: this.getCategoryName(category),
            caloriePercent: this.getCategoryPercent(category),
            icon: this.getCategoryIcon(category)
        };
    }

    getCategoryName(category) {
        const names = {
            breakfast: '🌅 Завтрак',
            lunch: '🌞 Обед',
            dinner: '🌙 Ужин',
            snack: '🍎 Перекус'
        };
        return names[category] || category;
    }

    getCategoryPercent(category) {
        const percents = {
            breakfast: 30,
            lunch: 35,
            dinner: 25,
            snack: 10
        };
        return percents[category] || 25;
    }

    getCategoryIcon(category) {
        const icons = {
            breakfast: '🌅',
            lunch: '🌞',
            dinner: '🌙',
            snack: '🍎'
        };
        return icons[category] || '🍽️';
    }

    getAllCategories() {
        return ['breakfast', 'lunch', 'dinner', 'snack'];
    }

    isReady() {
        return this.isLoaded && this.meals !== null;
    }
}

window.MealDatabase = MealDatabase;
