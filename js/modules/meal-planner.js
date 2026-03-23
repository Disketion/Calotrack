// js/modules/meal-planner.js - ИСПРАВЛЕННАЯ ВЕРСИЯ

class MealPlanner {
    constructor(database) {
        this.database = database;
    }

    /**
     * Получение профиля здоровья по ИМТ
     */
    getHealthProfile(bmi) {
        if (bmi >= 30) return 'obesity';
        if (bmi >= 25) return 'overweight';
        if (bmi >= 18.5) return 'normal';
        return 'underweight';
    }

    /**
     * Получение множителя порции с учетом цели
     */
    getMealMultiplier(meal, healthProfile, goal) {
        const profile = meal.healthProfiles?.[healthProfile];
        
        // Для набора массы
        if (goal === 'gain') {
            // Если блюдо высококалорийное (более 700 ккал) - множитель 1.0
            if (meal.calories >= 700) return 1.0;
            // Для остальных - максимальный множитель
            return profile?.portionMultiplier || 1.2;
        }
        
        // Для похудения
        if (goal === 'lose') {
            return profile?.portionMultiplier || 0.8;
        }
        
        // Для поддержания
        return profile?.portionMultiplier || 1.0;
    }

    /**
     * Стандартный подбор ближайшего блюда по калориям
     */
    selectBestMeal(meals, targetCalories) {
        if (!meals || meals.length === 0) return null;
        
        return meals.reduce((best, current) => {
            const currentDiff = Math.abs(current.calories - targetCalories);
            const bestDiff = Math.abs(best.calories - targetCalories);
            return currentDiff < bestDiff ? current : best;
        });
    }

    /**
     * Генерация дневного меню
     */
    generateDailyMenu(calories, bmi, goal) {
        if (!this.database.isReady()) {
            console.error('База данных не готова');
            return null;
        }
        
        const healthProfile = this.getHealthProfile(bmi);
        const categories = this.database.getAllCategories();
        const menu = {
            healthProfile,
            bmi,
            goal,
            totalCalories: calories,
            generatedAt: new Date().toISOString(),
            meals: {}
        };
        
        let totalGeneratedCalories = 0;
        
        for (const category of categories) {
            const categoryInfo = this.database.getCategoryInfo(category);
            const targetCategoryCalories = calories * (categoryInfo.caloriePercent / 100);
            
            // Используем новый метод с учетом цели
            const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
            
            if (meals && meals.length > 0) {
                let selectedMeal = null;
                
                // Для набора массы - выбираем самое калорийное блюдо в категории
                if (goal === 'gain') {
                    // Берем самое калорийное блюдо
                    selectedMeal = meals[0];
                    
                    // Если его калорийность сильно ниже цели, ищем подходящее
                    for (let i = 0; i < meals.length; i++) {
                        const meal = meals[i];
                        if (meal.calories >= targetCategoryCalories * 0.7) {
                            selectedMeal = meal;
                            break;
                        }
                    }
                } else {
                    // Для похудения и поддержания - стандартный подбор
                    selectedMeal = this.selectBestMeal(meals, targetCategoryCalories);
                }
                
                if (selectedMeal) {
                    const multiplier = this.getMealMultiplier(selectedMeal, healthProfile, goal);
                    const adjustedCalories = Math.round(selectedMeal.calories * multiplier);
                    
                    menu.meals[category] = {
                        ...selectedMeal,
                        originalCalories: selectedMeal.calories,
                        adjustedCalories,
                        multiplier,
                        note: selectedMeal.healthProfiles?.[healthProfile]?.note || null
                    };
                    
                    totalGeneratedCalories += adjustedCalories;
                } else {
                    menu.meals[category] = null;
                }
            } else {
                console.warn(`Нет блюд для категории ${category}`);
                menu.meals[category] = null;
            }
        }
        
        menu.generatedCalories = Math.round(totalGeneratedCalories);
        menu.calorieDifference = Math.round(menu.generatedCalories - calories);
        
        return menu;
    }

    /**
     * Генерация альтернативного блюда для категории
     */
    generateAlternative(category, currentMealId, calories, bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
        const categoryInfo = this.database.getCategoryInfo(category);
        const targetCalories = calories * (categoryInfo.caloriePercent / 100);
        
        // Исключаем текущее блюдо
        const alternativeMeals = meals.filter(meal => meal.id !== currentMealId);
        if (alternativeMeals.length === 0) return null;
        
        let selectedMeal = null;
        
        if (goal === 'gain') {
            // Для набора массы - берем самое калорийное из альтернатив
            selectedMeal = alternativeMeals[0];
            for (let i = 0; i < alternativeMeals.length; i++) {
                if (alternativeMeals[i].calories >= targetCalories * 0.7) {
                    selectedMeal = alternativeMeals[i];
                    break;
                }
            }
        } else {
            selectedMeal = this.selectBestMeal(alternativeMeals, targetCalories);
        }
        
        if (!selectedMeal) return null;
        
        const multiplier = this.getMealMultiplier(selectedMeal, healthProfile, goal);
        
        return {
            ...selectedMeal,
            originalCalories: selectedMeal.calories,
            adjustedCalories: Math.round(selectedMeal.calories * multiplier),
            multiplier,
            note: selectedMeal.healthProfiles?.[healthProfile]?.note || null
        };
    }

    /**
     * Получение рекомендации по питанию
     */
    getNutritionAdvice(bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        
        const advice = {
            obesity: {
                lose: [
                    '✅ Сократите порции на 20-30%',
                    '✅ Увеличьте потребление белка (2-2.2г/кг веса)',
                    '✅ Исключите простые углеводы и сахар',
                    '✅ Ешьте больше клетчатки (овощи, зелень)',
                    '✅ Пейте воду за 20 минут до еды'
                ],
                maintain: [
                    '⚠️ Для поддержания веса необходим строгий контроль калорий'
                ],
                gain: [
                    '❌ Набор массы при ожирении не рекомендуется'
                ]
            },
            overweight: {
                lose: [
                    '✅ Создайте дефицит калорий 300-500 ккал/день',
                    '✅ Увеличьте физическую активность',
                    '✅ Контролируйте размер порций'
                ],
                maintain: [
                    '✅ Поддерживайте текущий уровень активности',
                    '✅ Контролируйте калорийность рациона'
                ],
                gain: [
                    '⚠️ Набор массы требует интенсивных тренировок',
                    '✅ Увеличьте потребление белка до 2г/кг веса',
                    '✅ Добавьте калорийные перекусы (орехи, сухофрукты)',
                    '✅ Используйте протеиновые коктейли'
                ]
            },
            normal: {
                lose: [
                    '✅ Небольшой дефицит 200-300 ккал',
                    '✅ Увеличьте белковую составляющую'
                ],
                maintain: [
                    '✅ Соблюдайте баланс БЖУ',
                    '✅ Контролируйте калорийность'
                ],
                gain: [
                    '✅ Профицит 300-400 ккал',
                    '✅ Увеличьте порции сложных углеводов',
                    '✅ Добавьте калорийные перекусы (орехи, сухофрукты)'
                ]
            },
            underweight: {
                lose: [
                    '❌ Похудение при дефиците веса не рекомендуется'
                ],
                maintain: [
                    '⚠️ Требуется набор массы до нормальных показателей'
                ],
                gain: [
                    '✅ Увеличьте калорийность на 500-700 ккал',
                    '✅ Ешьте чаще (5-6 раз в день)',
                    '✅ Добавьте полезные жиры (орехи, авокадо)',
                    '✅ Используйте калорийные коктейли и смузи'
                ]
            }
        };
        
        return advice[healthProfile]?.[goal] || ['Следуйте сбалансированному питанию'];
    }
}

window.MealPlanner = MealPlanner;
