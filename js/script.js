document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('calorie-form');
    const resultEl = document.getElementById('result');
    const ctx = document.getElementById('bjuChart')?.getContext('2d');
    const weightCtx = document.getElementById('weightChart')?.getContext('2d');
    const menuBtn = document.getElementById('show-menu-btn');

    if (!form) return;

    let chart = null;
    let weightChart = null;
    let mealDatabase = null;
    let mealPlanner = null;
    let mealRenderer = null;
    let mealModal = null;
    let lastCalculation = null;

    // Инициализация модулей меню
    try {
        mealDatabase = new MealDatabase();
        await mealDatabase.init();
        mealPlanner = new MealPlanner(mealDatabase);
        mealRenderer = new MealRenderer();
        mealModal = new MealModal(mealRenderer);
        console.log('Модули меню успешно инициализированы');
    } catch (error) {
        console.error('Ошибка инициализации модулей меню:', error);
    }

    // Плагин для анимированных диаграмм
    const animatedDataLabelPlugin = {
        id: 'animatedDataLabel',
        afterDatasetsDraw(chart) {
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((arc, index) => {
                    const data = dataset.data[index];
                    if (data === 0) return;
                    const label = data + ' г';
                    const centerPoint = arc.getCenterPoint();
                    
                    ctx.save();
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 14px Outfit, Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(label, centerPoint.x, centerPoint.y);
                    ctx.restore();
                });
            });
        },
    };

    // Анимация появления формы
    animateFormElements();

    function animateFormElements() {
        const formElements = form.querySelectorAll('.calc-group');
        formElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('fadeIn');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Рассчитываем...';
        submitBtn.classList.add('loading');
        
        await new Promise(resolve => setTimeout(resolve, 800));
        calculateCalories();
        
        submitBtn.textContent = originalText;
        submitBtn.classList.remove('loading');
    });

    async function calculateCalories() {
        resultEl.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="skeleton skeleton-text" style="width: 80%; margin: 10px auto;"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin: 10px auto;"></div>
                <div class="skeleton skeleton-text" style="width: 70%; margin: 10px auto;"></div>
            </div>
        `;

        await new Promise(resolve => setTimeout(resolve, 1000));

        const gender = form.gender.value;
        const age = +form.age.value;
        const height = +form.height.value;
        const weight = +form.weight.value;
        const activity = +form.activity.value;
        const goal = form.goal.value;

        if (age < 10 || age > 120 || height < 50 || height > 250 || weight < 20 || weight > 300) {
            showError('Проверь корректность введённых данных.');
            return;
        }

        // Расчет BMR
        let bmr = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        let tdee = bmr * activity;

        switch (goal) {
            case 'lose': tdee *= 0.85; break;
            case 'gain': tdee *= 1.15; break;
        }

        const calories = Math.round(tdee);

        // Расчет БЖУ
        let proteinPerKg, fatPerKg, carbPerKg;
        switch (goal) {
            case 'lose':
                proteinPerKg = 2.2; fatPerKg = 0.8; carbPerKg = 2.5;
                break;
            case 'gain':
                proteinPerKg = 2.0; fatPerKg = 1.2; carbPerKg = 5.0;
                break;
            default:
                proteinPerKg = 1.8; fatPerKg = 1.0; carbPerKg = 4.0;
        }

        const proteinGrams = Math.round(weight * proteinPerKg);
        const fatGrams = Math.round(weight * fatPerKg);
        const carbGrams = Math.round(weight * carbPerKg);

        // Расчет ИМТ
        const heightM = height / 100;
        const bmi = +(weight / (heightM * heightM)).toFixed(1);
        let bmiStatus = '';
        let bmiColor = '';

        if (bmi < 16) {
            bmiStatus = 'Выраженный дефицит массы';
            bmiColor = '#e53935';
        } else if (bmi < 18.5) {
            bmiStatus = 'Недостаточный вес';
            bmiColor = '#ff9800';
        } else if (bmi < 25) {
            bmiStatus = 'Нормальный вес';
            bmiColor = '#4caf50';
        } else if (bmi < 30) {
            bmiStatus = 'Избыточный вес';
            bmiColor = '#ff9800';
        } else if (bmi < 35) {
            bmiStatus = 'Ожирение I степени';
            bmiColor = '#e53935';
        } else if (bmi < 40) {
            bmiStatus = 'Ожирение II степени';
            bmiColor = '#e53935';
        } else {
            bmiStatus = 'Ожирение III степени';
            bmiColor = '#b71c1c';
        }

        // Сохраняем данные для генерации меню
        lastCalculation = {
            calories,
            proteinGrams,
            fatGrams,
            carbGrams,
            bmi,
            weight,
            height,
            age,
            gender,
            goal,
            activity,
            bmiStatus,
            bmiColor
        };

        // Показываем результаты
        showResults(calories, proteinGrams, fatGrams, carbGrams, bmi, bmiStatus, bmiColor);
        
        // Создание графиков
        createAnimatedCharts(proteinGrams, fatGrams, carbGrams, weight, bmr, activity, calories);
        
        // Сохранение в историю
        saveToHistory(calories, proteinGrams, fatGrams, carbGrams);
        
        // Показываем кнопку меню
        if (menuBtn && mealDatabase && mealDatabase.isReady()) {
            menuBtn.style.display = 'block';
            menuBtn.classList.add('pulse-once');
        } else if (menuBtn && !mealDatabase?.isReady()) {
            menuBtn.style.display = 'block';
            menuBtn.style.opacity = '0.6';
            menuBtn.title = 'База меню загружается, попробуйте позже';
        }
    }

    function showResults(calories, protein, fat, carbs, bmi, bmiStatus, bmiColor) {
        resultEl.classList.add('pulse-once');
        
        resultEl.innerHTML = `
            <div style="animation: fadeIn 0.6s ease-out;">
                <strong>🎯 Суточный калораж:</strong> <span style="color: var(--primary-color); font-size: 1.3rem;">${calories} ккал</span><br>
                <strong>🥩 Белки:</strong> ${protein} г<br>
                <strong>🥑 Жиры:</strong> ${fat} г<br>
                <strong>🍚 Углеводы:</strong> ${carbs} г<br><br>
                <strong>📊 ИМТ:</strong> <span style="color: ${bmiColor}; font-weight: bold;">${bmi} — ${bmiStatus}</span>
            </div>
        `;

        setTimeout(() => {
            resultEl.classList.remove('pulse-once');
        }, 600);
    }

    function createAnimatedCharts(proteinGrams, fatGrams, carbGrams, weight, bmr, activity, calories) {
        createAnimatedBJUDiagram(proteinGrams, fatGrams, carbGrams);
        createAnimatedWeightChart(weight, bmr, activity, calories);
    }

    function createAnimatedBJUDiagram(proteinGrams, fatGrams, carbGrams) {
        if (!ctx) return;
        
        const data = {
            labels: ['Белки', 'Жиры', 'Углеводы'],
            datasets: [{
                label: 'Граммы',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(33, 150, 243, 0.8)'
                ],
                borderColor: [
                    'rgb(76, 175, 80)',
                    'rgb(255, 152, 0)',
                    'rgb(33, 150, 243)'
                ],
                borderWidth: 2,
                hoverOffset: 20,
                borderRadius: 8,
            }],
        };

        const options = {
            responsive: false,
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 14, weight: '600', family: 'Outfit' },
                        color: 'var(--text-color)'
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed} г`,
                    },
                    backgroundColor: 'var(--card-bg)',
                    titleColor: 'var(--text-color)',
                    bodyColor: 'var(--text-color)',
                    borderColor: 'var(--primary-color)',
                    borderWidth: 1
                },
            },
            cutout: '60%',
        };

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options,
            plugins: [animatedDataLabelPlugin],
        });

        setTimeout(() => {
            chart.data.datasets[0].data = [proteinGrams, fatGrams, carbGrams];
            chart.update();
        }, 500);
    }

    function createAnimatedWeightChart(currentWeight, bmr, activity, targetCalories) {
        if (!weightCtx) return;

        const maintenanceCalories = bmr * activity;
        const calorieDiffPerDay = targetCalories - maintenanceCalories;
        const monthlyWeightChange = +(calorieDiffPerDay * 30 / 7700).toFixed(2);

        const weightData = Array.from({ length: 12 }, (_, i) =>
            +(currentWeight + monthlyWeightChange * (i + 1)).toFixed(1)
        );

        const monthLabels = [
            '1 мес', '2 мес', '3 мес', '4 мес', '5 мес', '6 мес',
            '7 мес', '8 мес', '9 мес', '10 мес', '11 мес', '12 мес'
        ];

        if (weightChart) weightChart.destroy();

        weightChart = new Chart(weightCtx, {
            type: 'bar',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Вес (кг)',
                    data: new Array(12).fill(currentWeight),
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: 'rgb(76, 175, 80)',
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 28,
                }]
            },
            options: {
                responsive: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: value => value + ' кг',
                            font: { family: 'Outfit' },
                            color: 'var(--text-color)'
                        },
                        grid: {
                            color: 'var(--border-color)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { family: 'Outfit' },
                            color: 'var(--text-color)'
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Вес: ${ctx.parsed.y} кг`
                        },
                        backgroundColor: 'var(--card-bg)',
                        titleColor: 'var(--text-color)',
                        bodyColor: 'var(--text-color)',
                        borderColor: 'var(--primary-color)'
                    }
                }
            }
        });

        setTimeout(() => {
            weightChart.data.datasets[0].data = weightData;
            weightChart.update();
        }, 1000);
    }

    function showError(message) {
        resultEl.classList.add('shake');
        resultEl.innerHTML = `<strong style="color: var(--error-color);">⚠️ ${message}</strong>`;
        
        setTimeout(() => {
            resultEl.classList.remove('shake');
        }, 500);
    }

    function saveToHistory(calories, proteinGrams, fatGrams, carbGrams) {
        const historyItem = {
            date: new Date().toLocaleString('ru-RU'),
            calories,
            proteinGrams,
            fatGrams,
            carbGrams,
        };

        let history = JSON.parse(localStorage.getItem('caloHistory')) || [];
        const last = history[0];
        
        if (!last || JSON.stringify(last) !== JSON.stringify(historyItem)) {
            history.unshift(historyItem);
            if (history.length > 20) history = history.slice(0, 20);
            localStorage.setItem('caloHistory', JSON.stringify(history));
            showNotification('Расчет сохранен в историю!', 'success');
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<strong>${type === 'success' ? '✅' : 'ℹ️'} ${message}</strong>`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card-bg);
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-hover);
            z-index: 2000;
            animation: slideIn 0.5s ease-out;
            border-left: 4px solid var(--primary-color);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease-out reverse';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Обработчик кнопки генерации меню
    if (menuBtn) {
        menuBtn.addEventListener('click', async () => {
            if (!lastCalculation) {
                showNotification('Сначала выполните расчет калорий!', 'warning');
                return;
            }
            
            if (!mealDatabase || !mealDatabase.isReady()) {
                showNotification('База данных меню загружается, попробуйте через секунду', 'warning');
                return;
            }
            
            try {
                // Показываем загрузку
                if (mealModal) {
                    mealModal.showLoading();
                }
                
                // Генерируем меню
                const menu = mealPlanner.generateDailyMenu(
                    lastCalculation.calories,
                    lastCalculation.bmi,
                    lastCalculation.goal
                );
                
                if (!menu) {
                    throw new Error('Не удалось сгенерировать меню');
                }
                
                // Показываем модальное окно с меню
                if (mealModal) {
                    mealModal.show(menu, lastCalculation);
                }
                
                // Анимация кнопки
                menuBtn.classList.add('pulse-once');
                setTimeout(() => menuBtn.classList.remove('pulse-once'), 600);
                
            } catch (error) {
                console.error('Ошибка генерации меню:', error);
                showNotification('Ошибка при генерации меню. Попробуйте позже.', 'error');
                
                // Скрываем загрузку если была
                if (mealModal && mealModal.modal) {
                    mealModal.hide();
                }
            }
        });
    }

    // Слушаем событие обновления блюда
    document.addEventListener('requestMealRefresh', async (e) => {
        const { category, currentMealId, menuData } = e.detail;
        
        if (!mealPlanner || !lastCalculation) return;
        
        try {
            const newMeal = mealPlanner.generateAlternative(
                category,
                currentMealId,
                lastCalculation.calories,
                lastCalculation.bmi,
                lastCalculation.goal
            );
            
            if (newMeal && mealRenderer) {
                mealRenderer.updateCategory(category, newMeal);
                showNotification('Блюдо заменено!', 'success');
            } else {
                showNotification('Нет альтернативных блюд', 'warning');
            }
        } catch (error) {
            console.error('Ошибка замены блюда:', error);
            showNotification('Не удалось заменить блюдо', 'error');
        }
    });

    // Улучшение для мобильного ввода
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('pulse-once');
            setTimeout(() => {
                this.parentElement.classList.remove('pulse-once');
            }, 600);
        });
    });

    // Анимация для кнопок продуктов
    const productButtons = document.querySelectorAll('.product-button');
    productButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('pulse-once');
            setTimeout(() => {
                this.classList.remove('pulse-once');
            }, 600);
        });
    });

    // Анимация ползунка
    const activitySlider = document.getElementById('activity');
    if (activitySlider) {
        activitySlider.addEventListener('input', function() {
            const percent = ((this.value - 1.2) / (1.9 - 1.2)) * 100;
            this.style.background = `linear-gradient(90deg, #4caf50 0%, #81c784 ${percent}%, #aed581 ${percent}%, #dce775 75%, #ffeb3b 100%)`;
        });
        // Инициализация
        const initialPercent = ((activitySlider.value - 1.2) / (1.9 - 1.2)) * 100;
        activitySlider.style.background = `linear-gradient(90deg, #4caf50 0%, #81c784 ${initialPercent}%, #aed581 ${initialPercent}%, #dce775 75%, #ffeb3b 100%)`;
    }
});

// CSS анимации для формы
const style = document.createElement('style');
style.textContent = `
    .calc-group {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
    }
    
    .menu-btn {
        transition: all 0.3s ease;
    }
    
    .menu-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(255, 152, 0, 0.4);
    }
`;
document.head.appendChild(style);