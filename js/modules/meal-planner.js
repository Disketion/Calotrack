// js/modules/meal-planner.js - ИСПРАВЛЕННАЯ ВЕРСИЯ (правильный подбор)

class MealPlanner {
    constructor(database) {
        this.database = database;
    }

    getHealthProfile(bmi) {
        if (bmi >= 30) return 'obesity';
        if (bmi >= 25) return 'overweight';
        if (bmi >= 18.5) return 'normal';
        return 'underweight';
    }

    getMealMultiplier(meal, healthProfile, goal) {
        const profile = meal.healthProfiles?.[healthProfile];
        
        if (goal === 'gain') {
            // Для высококалорийных блюд - множитель 1.0
            if (meal.calories >= 700) return 1.0;
            return profile?.portionMultiplier || 1.2;
        }
        
        if (goal === 'lose') {
            return profile?.portionMultiplier || 0.8;
        }
        
        return profile?.portionMultiplier || 1.0;
    }

    selectBestMeal(meals, targetCalories, goal = 'maintain') {
        if (!meals || meals.length === 0) return null;
        
        // Для набора массы - ищем блюдо, максимально близкое к цели, но не сильно превышающее
        if (goal === 'gain') {
            // Сначала ищем блюда, которые не превышают цель более чем на 30%
            const reasonable = meals.filter(meal => meal.calories <= targetCalories * 1.3);
            
            if (reasonable.length > 0) {
                // Из разумных выбираем ближайшее к цели
                return reasonable.reduce((best, current) => {
                    const currentDiff = Math.abs(current.calories - targetCalories);
                    const bestDiff = Math.abs(best.calories - targetCalories);
                    return currentDiff < bestDiff ? current : best;
                });
            }
            
            // Если нет разумных, берем ближайшее вообще
            return meals.reduce((best, current) => {
                const currentDiff = Math.abs(current.calories - targetCalories);
                const bestDiff = Math.abs(best.calories - targetCalories);
                return currentDiff < bestDiff ? current : best;
            });
        }
        
        // Для похудения и поддержания - стандартный подбор
        return meals.reduce((best, current) => {
            const currentDiff = Math.abs(current.calories - targetCalories);
            const bestDiff = Math.abs(best.calories - targetCalories);
            return currentDiff < bestDiff ? current : best;
        });
    }

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
            
            // Получаем блюда с учетом цели
            const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
            
            if (meals && meals.length > 0) {
                // Используем улучшенный подбор с учетом цели
                const selectedMeal = this.selectBestMeal(meals, targetCategoryCalories, goal);
                
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

    generateAlternative(category, currentMealId, calories, bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        const meals = this.database.getMealsByCategoryWithGoal(category, healthProfile, goal);
        const categoryInfo = this.database.getCategoryInfo(category);
        const targetCalories = calories * (categoryInfo.caloriePercent / 100);
        
        const alternativeMeals = meals.filter(meal => meal.id !== currentMealId);
        if (alternativeMeals.length === 0) return null;
        
        const selectedMeal = this.selectBestMeal(alternativeMeals, targetCalories, goal);
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

    getNutritionAdvice(bmi, goal) {
        const healthProfile = this.getHealthProfile(bmi);
        
        const advice = {
            obesity: {
                lose: [
                    '✅ Сократите порции на 20-30%',
                    '✅ Увеличьте потребление белка (2-2.2г/кг веса)',
                    '✅ Исключите простые углеводы и сахар',
                    '✅ Ешьте больше клетчатки (овощи, зелень)'
                ],
                maintain: ['⚠️ Для поддержания веса необходим строгий контроль калорий'],
                gain: ['❌ Набор массы при ожирении не рекомендуется']
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
                    '✅ Добавьте калорийные перекусы'
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
                    '✅ Добавьте калорийные перекусы'
                ]
            },
            underweight: {
                lose: ['❌ Похудение при дефиците веса не рекомендуется'],
                maintain: ['⚠️ Требуется набор массы до нормальных показателей'],
                gain: [
                    '✅ Увеличьте калорийность на 500-700 ккал',
                    '✅ Ешьте чаще (5-6 раз в день)',
                    '✅ Добавьте полезные жиры (орехи, авокадо)'
                ]
            }
        };
        
        return advice[healthProfile]?.[goal] || ['Следуйте сбалансированному питанию'];
    }
}

window.MealPlanner = MealPlanner;
