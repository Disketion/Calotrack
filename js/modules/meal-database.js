class MealDatabase {
    constructor() {
        // Инициализируем с пустыми массивами сразу
        this.meals = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: []
        };
        this.categories = null;
        this.isLoaded = false;
        this.loadingPromise = null;
        
        // Сразу заполняем дефолтными данными
        this.initDefaultData();
    }

    initDefaultData() {
        // Дефолтные блюда - гарантированно работают
        this.meals = {
            breakfast: [
                {
                    id: "breakfast_001",
                    name: "Овсянка с ягодами",
                    image: "img/meals/breakfast/oatmeal-berries.jpg",
                    calories: 350,
                    protein: 12,
                    fat: 8,
                    carbs: 58,
                    fiber: 6,
                    ingredients: ["овсяные хлопья 50г", "ягоды 100г", "мед 10г"],
                    preparationTime: 10,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "breakfast_002",
                    name: "Омлет с овощами",
                    image: "img/meals/breakfast/omelette-veggies.jpg",
                    calories: 420,
                    protein: 28,
                    fat: 24,
                    carbs: 12,
                    fiber: 3,
                    ingredients: ["яйца 3 шт", "помидор 1 шт", "перец 1/2 шт", "сыр 30г"],
                    preparationTime: 15,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                },
                {
                    id: "breakfast_003",
                    name: "Творог с ягодами",
                    image: "img/meals/breakfast/cottage-cheese-berries.jpg",
                    calories: 350,
                    protein: 32,
                    fat: 12,
                    carbs: 28,
                    fiber: 5,
                    ingredients: ["творог 5% 200г", "ягоды 100г", "грецкие орехи 15г"],
                    preparationTime: 5,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                }
            ],
            lunch: [
                {
                    id: "lunch_001",
                    name: "Куриная грудка с киноа",
                    image: "img/meals/lunch/chicken-quinoa.jpg",
                    calories: 520,
                    protein: 45,
                    fat: 18,
                    carbs: 48,
                    fiber: 8,
                    ingredients: ["куриная грудка 150г", "киноа 80г", "брокколи 150г", "масло 10г"],
                    preparationTime: 35,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "lunch_002",
                    name: "Рыба с рисом",
                    image: "img/meals/lunch/fish-rice.jpg",
                    calories: 540,
                    protein: 38,
                    fat: 16,
                    carbs: 58,
                    fiber: 6,
                    ingredients: ["филе рыбы 150г", "рис бурый 70g", "овощи 200г"],
                    preparationTime: 40,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "lunch_003",
                    name: "Салат с тунцом",
                    image: "img/meals/lunch/tuna-salad.jpg",
                    calories: 450,
                    protein: 32,
                    fat: 28,
                    carbs: 18,
                    fiber: 9,
                    ingredients: ["тунец 100г", "авокадо 1/2 шт", "листья салата 100g", "помидоры 100g"],
                    preparationTime: 15,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                }
            ],
            dinner: [
                {
                    id: "dinner_001",
                    name: "Семга с овощами",
                    image: "img/meals/dinner/salmon-veggies.jpg",
                    calories: 460,
                    protein: 42,
                    fat: 28,
                    carbs: 14,
                    fiber: 5,
                    ingredients: ["семга 150г", "спаржа 100г", "брокколи 100г"],
                    preparationTime: 25,
                    difficulty: "Средне",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.7 },
                        overweight: { recommended: true, portionMultiplier: 0.85 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.15 }
                    }
                },
                {
                    id: "dinner_002",
                    name: "Куриный салат",
                    image: "img/meals/dinner/chicken-salad.jpg",
                    calories: 380,
                    protein: 38,
                    fat: 16,
                    carbs: 18,
                    fiber: 6,
                    ingredients: ["куриная грудка 120г", "греческий йогурт 100г", "огурцы 100г", "помидоры 100г"],
                    preparationTime: 20,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                }
            ],
            snack: [
                {
                    id: "snack_001",
                    name: "Греческий йогурт",
                    image: "img/meals/snacks/greek-yogurt.jpg",
                    calories: 150,
                    protein: 12,
                    fat: 5,
                    carbs: 14,
                    fiber: 2,
                    ingredients: ["греческий йогурт 120г", "ягоды 80г"],
                    preparationTime: 3,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 1.0 },
                        overweight: { recommended: true, portionMultiplier: 1.0 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
                    }
                },
                {
                    id: "snack_002",
                    name: "Яблоко с миндалем",
                    image: "img/meals/snacks/apple-almonds.jpg",
                    calories: 180,
                    protein: 4,
                    fat: 12,
                    carbs: 18,
                    fiber: 4,
                    ingredients: ["яблоко 1 шт", "миндаль 20г"],
                    preparationTime: 2,
                    difficulty: "Легко",
                    healthProfiles: {
                        obesity: { recommended: true, portionMultiplier: 0.8 },
                        overweight: { recommended: true, portionMultiplier: 0.9 },
                        normal: { recommended: true, portionMultiplier: 1.0 },
                        underweight: { recommended: true, portionMultiplier: 1.2 }
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
    }

    async init() {
        if (this.isLoaded) return true;
        if (this.loadingPromise) return this.loadingPromise;
        
        this.loadingPromise = this.loadDatabase();
        return this.loadingPromise;
    }

    async loadDatabase() {
        try {
            // Пытаемся загрузить внешний JSON
            const response = await fetch('data/meals.json');
            if (response.ok) {
                const data = await response.json();
                
                // Проверяем и обновляем данные
                if (data.breakfast && Array.isArray(data.breakfast)) {
                    this.meals.breakfast = data.breakfast;
                }
                if (data.lunch && Array.isArray(data.lunch)) {
                    this.meals.lunch = data.lunch;
                }
                if (data.dinner && Array.isArray(data.dinner)) {
                    this.meals.dinner = data.dinner;
                }
                if (data.snack && Array.isArray(data.snack)) {
                    this.meals.snack = data.snack;
                }
                
                console.log('Внешняя база меню загружена');
            } else {
                console.log('Используем встроенную базу меню');
            }
            
            // Пытаемся загрузить категории
            try {
                const catResponse = await fetch('data/categories.json');
                if (catResponse.ok) {
                    const catData = await catResponse.json();
                    if (catData.categories) {
                        this.categories = catData;
                    }
                }
            } catch (e) {
                console.log('Используем встроенные категории');
            }
            
            this.isLoaded = true;
            console.log('База данных готова, категории:', Object.keys(this.meals));
            return true;
            
        } catch (error) {
            console.error('Ошибка загрузки, используем встроенную базу:', error);
            this.isLoaded = true; // Помечаем как загруженную, так как у нас есть дефолтные данные
            return true;
        }
    }

    getMealsByCategory(category, healthProfile = null) {
        // Гарантированно возвращаем массив
        if (!this.meals) {
            console.warn('meals не инициализирован');
            return [];
        }
        
        const mealsArray = this.meals[category];
        
        if (!mealsArray || !Array.isArray(mealsArray)) {
            console.warn(`Категория ${category} не найдена, возвращаем пустой массив`);
            return [];
        }
        
        if (!healthProfile) {
            return mealsArray;
        }
        
        // Фильтруем по профилю здоровья
        return mealsArray.filter(meal => {
            if (!meal.healthProfiles) return true;
            const profile = meal.healthProfiles[healthProfile];
            return profile ? profile.recommended !== false : true;
        });
    }

    getAllCategories() {
        return ['breakfast', 'lunch', 'dinner', 'snack'];
    }

    getCategoryInfo(category) {
        if (this.categories?.categories?.[category]) {
            return this.categories.categories[category];
        }
        
        // Дефолтные значения
        const defaults = {
            breakfast: { name: '🌅 Завтрак', caloriePercent: 30, icon: '🌅' },
            lunch: { name: '🌞 Обед', caloriePercent: 35, icon: '🌞' },
            dinner: { name: '🌙 Ужин', caloriePercent: 25, icon: '🌙' },
            snack: { name: '🍎 Перекус', caloriePercent: 10, icon: '🍎' }
        };
        
        return defaults[category] || { name: category, caloriePercent: 25, icon: '🍽️' };
    }

    getMealById(id) {
        const categories = this.getAllCategories();
        
        for (const category of categories) {
            const mealsArray = this.meals[category];
            if (mealsArray && Array.isArray(mealsArray)) {
                const meal = mealsArray.find(m => m.id === id);
                if (meal) return { ...meal, category };
            }
        }
        return null;
    }

    isReady() {
        return true; // Всегда true, так как у нас есть дефолтные данные
    }
}

window.MealDatabase = MealDatabase;
