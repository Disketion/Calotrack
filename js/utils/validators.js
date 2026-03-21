// js/utils/validators.js

class Validators {
    /**
     * Проверка валидности BMI
     */
    static validateBMI(bmi) {
        if (typeof bmi !== 'number' || isNaN(bmi)) {
            return { valid: false, message: 'Некорректное значение ИМТ' };
        }
        if (bmi < 10 || bmi > 50) {
            return { valid: false, message: 'ИМТ выходит за пределы нормы (10-50)' };
        }
        return { valid: true, message: 'OK' };
    }

    /**
     * Проверка калорий
     */
    static validateCalories(calories) {
        if (typeof calories !== 'number' || isNaN(calories)) {
            return { valid: false, message: 'Некорректное значение калорий' };
        }
        if (calories < 500 || calories > 5000) {
            return { valid: false, message: 'Калории выходят за пределы нормы (500-5000)' };
        }
        return { valid: true, message: 'OK' };
    }

    /**
     * Проверка структуры блюда
     */
    static validateMeal(meal) {
        const requiredFields = ['id', 'name', 'calories', 'protein', 'fat', 'carbs', 'healthProfiles'];
        for (const field of requiredFields) {
            if (!meal[field]) {
                return { valid: false, message: `Отсутствует поле: ${field}` };
            }
        }
        
        if (meal.calories < 0 || meal.calories > 2000) {
            return { valid: false, message: `Некорректные калории для блюда ${meal.name}` };
        }
        
        return { valid: true, message: 'OK' };
    }

    /**
     * Проверка всех блюд в категории
     */
    static validateMealsCategory(meals, categoryName) {
        const errors = [];
        meals.forEach((meal, index) => {
            const result = this.validateMeal(meal);
            if (!result.valid) {
                errors.push(`${categoryName}[${index}]: ${result.message}`);
            }
        });
        return errors;
    }

    /**
     * Проверка профиля здоровья
     */
    static validateHealthProfile(healthProfile) {
        const validProfiles = ['obesity', 'overweight', 'normal', 'underweight'];
        if (!validProfiles.includes(healthProfile)) {
            return { valid: false, message: `Неизвестный профиль: ${healthProfile}` };
        }
        return { valid: true, message: 'OK' };
    }
}

// Экспортируем для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Validators;
}