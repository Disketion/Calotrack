// js/modules/meal-planner.js

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
     * Подбор оптимального блюда
     */
    selectBestMeal(meals, targetCalories, healthProfile) {
        if (!meals || meals.length === 0) return null;
        
        // Фильтруем подходящие блюда
        const suitable = meals.filter(meal => {
            const profile = meal.healthProfiles?.[healthProfile];
            return profile && profile.recommended !== false;
        });
        
        if (suitable.length === 0) return meals[0];
        
        // Выбираем ближайшее по калориям с учетом множителя порции
        return suitable.reduce((best, current) => {
            const currentMultiplier = current.healthProfiles?.[healthProfile]?.portionMultiplier || 1;
            const currentCalories = current.calories * currentMultiplier;
            const bestMultiplier = best.healthProfiles?.[healthProfile]?.portionMultiplier || 1;
            const bestCalories = best.calories * bestMultiplier;
            
            const currentDiff = Math.abs(currentCalories - targetCalories);
            const bestDiff = Math.abs(bestCalories - targetCalories);
            
            return currentDiff < bestDiff ? current : best;
        });
    }
    
   // public/js/modules/meal-planner.js - добавьте проверки в generateDailyMenu

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
        
        // Получаем блюда для категории - ЭТО ВОЗВРАЩАЕТ МАССИВ
        const meals = this.database.getMealsByCategory(category, healthProfile);
        
        // Проверяем, что meals - это массив
        if (meals && Array.isArray(meals) && meals.length > 0) {
            const selectedMeal = this.selectBestMeal(meals, targetCategoryCalories, healthProfile);
            
            if (selectedMeal) {
                const multiplier = selectedMeal.healthProfiles?.[healthProfile]?.portionMultiplier || 1;
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
                    '⚠️ Для поддержания веса необходим строгий контроль калорий',
                    '⚠️ Рекомендуется консультация диетолога'
                ],
                gain: [
                    '❌ Набор массы при ожирении не рекомендуется без консультации врача'
                ]
            },
            overweight: {
                lose: [
                    '✅ Создайте дефицит калорий 300-500 ккал/день',
                    '✅ Увеличьте физическую активность',
                    '✅ Контролируйте размер порций',
                    '✅ Исключите калорийные напитки'
                ],
                maintain: [
                    '✅ Поддерживайте текущий уровень активности',
                    '✅ Контролируйте калорийность рациона',
                    '✅ Регулярно взвешивайтесь'
                ],
                gain: [
                    '⚠️ Набор массы требует увеличения физической активности',
                    '✅ Увеличьте порции белковых продуктов'
                ]
            },
            normal: {
                lose: [
                    '✅ Небольшой дефицит 200-300 ккал',
                    '✅ Увеличьте белковую составляющую',
                    '✅ Добавьте кардио-тренировки'
                ],
                maintain: [
                    '✅ Соблюдайте баланс БЖУ',
                    '✅ Контролируйте калорийность',
                    '✅ Регулярно корректируйте рацион'
                ],
                gain: [
                    '✅ Профицит 300-400 ккал',
                    '✅ Увеличьте порции сложных углеводов',
                    '✅ Добавьте силовые тренировки'
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
                    '✅ Включите протеиновые коктейли'
                ]
            }
        };
        
        return advice[healthProfile]?.[goal] || ['Следуйте сбалансированному питанию'];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MealPlanner;
}
