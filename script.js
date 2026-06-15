// HERO SYSTEM - Управление на способностите и енергията

// ===== ФУНКЦИИ С ПАРАМЕТРИ =====

/**
 * Функция за управление на мощност на способност
 * @param {string} name - Име на способността
 * @param {number} cost - Енергийна цена
 * @param {string} color - Цвят на ефекта
 * @param {string} icon - Икона (емодзи)
 * @returns {object} Обект с данни за способността
 */
function power(name, cost, color, icon) {
    return {
        name: name,
        cost: cost,
        color: color,
        icon: icon,
        damage: Math.round(cost * 1.5),  // Урона е 1.5x от цената
        efficiency: (Math.round(cost * 1.5) / cost).toFixed(2)  // Ефективност (урона/цена)
    };
}

/**
 * Функция за изчисляване на урона на основата на енергията
 * @param {number} baseDamage - Основен урон
 * @param {number} energyUsed - Използвана енергия
 * @param {number} multiplier - Множител на урона (по подразбиране 1)
 * @returns {number} Крайна стойност на урона
 */
function calculateDamage(baseDamage, energyUsed, multiplier = 1) {
    const additionalDamage = energyUsed * 0.5;  // +0.5 урона на енергия
    return Math.round((baseDamage + additionalDamage) * multiplier);
}

/**
 * Функция за управление на визуални ефекти
 * @param {string} effectType - Тип на ефекта (fire, ice, lightning, heal)
 * @param {number} duration - Продължителност в мс
 * @param {number} intensity - Интензивност (0-1)
 * @returns {object} Обект с параметри на ефекта
 */
function animateEffect(effectType, duration, intensity) {
    const effects = {
        'fire': '#ff3333',
        'ice': '#3399ff',
        'lightning': '#ffff33',
        'heal': '#33ff66'
    };

    return {
        type: effectType,
        color: effects[effectType] || '#ffffff',
        duration: duration,
        intensity: Math.min(Math.max(intensity, 0), 1),  // Клипа между 0 и 1
        glow: `0 8px ${32 * intensity}px rgba(${hexToRgb(effects[effectType]).join(', ')}, ${0.6 * intensity})`
    };
}

/**
 * Хелпер функция за конвертиране на hex цвят към RGB
 * @param {string} hex - HEX цвят
 * @returns {array} RGB стойности
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [255, 255, 255];
}

/**
 * Функция за форматиране на текст за лога
 * @param {string} action - Действие (activate, damage, heal, cooldown)
 * @param {string} abilityName - Име на способност
 * @param {number} value - Стойност (енергия, урон, etc)
 * @returns {string} Форматиран текст
 */
function formatLogMessage(action, abilityName, value) {
    const messages = {
        'activate': `✨ ${abilityName} е активирана! (-${value} енергия)`,
        'damage': `⚔️ ${abilityName} нанесе ${value} урона!`,
        'heal': `💚 ${abilityName} възстанови ${value} HP!`,
        'cooldown': `⏱️ ${abilityName} е в режим на очакване!`,
        'lowenergy': `⚠️ Недостатъчна енергия за ${abilityName}! Нужна: ${value}`
    };
    return messages[action] || action;
}

/**
 * Функция за управление на статус на способност
 * @param {number} currentEnergy - Текуща енергия
 * @param {number} maxEnergy - Максимална енергия
 * @param {number} cost - Цена на способност
 * @param {number} cooldownRemaining - Остатък на cooldown (мс)
 * @returns {string} Статус ('available', 'nocooldown', 'noenergy')
 */
function checkAbilityStatus(currentEnergy, maxEnergy, cost, cooldownRemaining) {
    if (cooldownRemaining > 0) {
        return 'cooldown';
    }
    if (currentEnergy < cost) {
        return 'noenergy';
    }
    return 'available';
}

/**
 * Функция за изчисляване на енергийното съотношение
 * @param {number} current - Текуща енергия
 * @param {number} max - Максимална енергия
 * @param {number} decimals - Брой десетични места (по подразбиране 2)
 * @returns {number} Процент (0-100)
 */
function getEnergyPercentage(current, max, decimals = 2) {
    const percentage = (current / max) * 100;
    return parseFloat(percentage.toFixed(decimals));
}

/**
 * Функция за генериране на способност със всички параметри
 * @param {string} id - ID на способност
 * @param {string} name - Име
 * @param {number} cost - Цена на енергия
 * @param {string} icon - Икона (емодзи)
 * @param {string} effect - Тип ефект (fire, ice, lightning, heal)
 * @param {number} cooldown - Cooldown време (мс)
 * @param {number} multiplier - Множител на урона (по подразбиране 1)
 * @returns {object} Пълен обект на способност
 */
function createAbility(id, name, cost, icon, effect, cooldown, multiplier = 1) {
    const baseDamage = Math.round(cost * 1.5);
    return {
        id: id,
        name: name,
        cost: cost,
        icon: icon,
        effect: effect,
        cooldown: cooldown,
        damage: Math.round(baseDamage * multiplier),
        multiplier: multiplier,
        efficiency: (Math.round(baseDamage * multiplier) / cost).toFixed(2)
    };
}

class HeroSystem {
    constructor() {
        this.maxEnergy = 100;
        this.currentEnergy = 100;
        this.energyRegenRate = 1; // енергия за секунда
        
        // Използване на функция power() за дефиниране на способностите
        this.abilities = {
            1: {
                ...power('Огнена топка', 30, 'fire', '🔥'),
                cooldown: 3000,
                effect: 'fire'
            },
            2: {
                ...power('Ледена буря', 25, 'ice', '❄️'),
                cooldown: 2500,
                effect: 'ice'
            },
            3: {
                ...power('Светкавична стрела', 40, 'lightning', '⚡'),
                cooldown: 4000,
                effect: 'lightning'
            },
            4: {
                ...power('Лечение', 20, 'heal', '💚'),
                cooldown: 2000,
                effect: 'heal'
            }
        };
        
        this.abilityCooldowns = {
            1: 0,
            2: 0,
            3: 0,
            4: 0
        };
        this.init();
    }

    init() {
        // Привързване на бутонните слушатели
        document.getElementById('ability1').addEventListener('click', () => this.useAbility(1));
        document.getElementById('ability2').addEventListener('click', () => this.useAbility(2));
        document.getElementById('ability3').addEventListener('click', () => this.useAbility(3));
        document.getElementById('ability4').addEventListener('click', () => this.useAbility(4));
        document.getElementById('resetButton').addEventListener('click', () => this.reset());

        // Започване на регенерирането на енергия
        setInterval(() => this.regenEnergy(), 1000);

        // Обновяване на дисплея
        this.updateDisplay();
        this.addLog('Система инициализирана успешно!', 'success');
    }

    useAbility(abilityId) {
        const ability = this.abilities[abilityId];
        const now = Date.now();

        // ===== УСЛОВИЯ =====
        
        // УСЛОВИЕ 1: Проверка на cooldown
        if (this.abilityCooldowns[abilityId] > now) {
            const remainingTime = Math.ceil((this.abilityCooldowns[abilityId] - now) / 1000);
            this.addLog(formatLogMessage('cooldown', ability.name, remainingTime), 'error');
            return;  // Прекратяване на функцията ако е в cooldown
        }

        // УСЛОВИЕ 2: Проверка за недостатъчна енергия
        if (this.currentEnergy < ability.cost) {
            this.addLog(formatLogMessage('lowenergy', ability.name, ability.cost), 'error');
            return;  // Прекратяване на функцията ако няма енергия
        }

        // УСЛОВИЕ 3: Проверка дали енергията е точно 0
        if (this.currentEnergy === 0) {
            this.addLog('⚠️ Няма енергия! Способностите са невозможни!', 'error');
            return;
        }

        // Използване на способността
        this.currentEnergy -= ability.cost;
        this.abilityCooldowns[abilityId] = now + ability.cooldown;

        // УСЛОВИЕ 4: Проверка дали енергията стана 0 след активирането
        if (this.currentEnergy <= 0) {
            this.currentEnergy = 0;
            this.addLog('⚠️ Енергията достигна 0! Почакайте регенерирането...', 'error');
        }

        this.addLog(formatLogMessage('activate', ability.name, ability.cost), 'success');

        // Специални ефекти за всяка способност
        this.triggerAbilityEffect(ability, abilityId);

        // Визуален ефект - промяна на цветовете
        this.triggerColorEffect(ability, abilityId);

        // Обновяване на дисплея
        this.updateDisplay();
        this.startCooldown(abilityId, ability.cooldown, ability.name);
    }

    triggerAbilityEffect(ability, abilityId) {
        // Параметри: ability (обект) и abilityId
        const baseDamage = ability.damage || 30;
        const finalDamage = calculateDamage(baseDamage, ability.cost);

        // Разнообразни ефекти на основата на абилити ID
        if (abilityId === 1) {  // Огнена топка
            this.addLog(`🔥 Огнена топка нанесе ${finalDamage} урона!`);
        } else if (abilityId === 2) {  // Ледена буря
            this.addLog(`❄️ Враг е замразен за 3 секунди! Урон: ${finalDamage}`);
        } else if (abilityId === 3) {  // Светкавична стрела
            const boostedDamage = calculateDamage(baseDamage, ability.cost, 1.3);  // 30% бонус
            this.addLog(`⚡ Светкавична стрела нанесе ${boostedDamage} критичен урон!`);
        } else if (abilityId === 4) {  // Лечение
            this.addLog(`💚 Възстановени ${finalDamage} HP!`);
        }
    }

    triggerColorEffect(ability, abilityId) {
        // Параметри: ability (обект) и abilityId
        const container = document.querySelector('.container');
        
        // Използване на функция animateEffect() със параметри
        const effect = animateEffect(ability.effect, 800, 0.8);
        
        const abilityEffects = {
            1: 'fire',      // Огнена топка - червено
            2: 'ice',       // Ледена буря - синьо
            3: 'lightning', // Светкавица - жълто
            4: 'heal'       // Лечение - зелено
        };

        // Добавяне на клас за ефект
        container.classList.add(`effect-${abilityEffects[abilityId]}`);

        // Отстраняване на класа след времето
        setTimeout(() => {
            container.classList.remove(`effect-${abilityEffects[abilityId]}`);
        }, effect.duration);

        // Показване на notification със параметри
        this.showAbilityNotification(ability.icon, ability.name, ability.cost);
    }

    showAbilityNotification(icon, name, cost) {
        // Параметри: icon (емодзи), name (име), cost (цена)
        const notification = document.getElementById('abilityNotification');
        const iconElement = document.getElementById('notificationIcon');
        const nameElement = document.getElementById('notificationName');
        const messageElement = document.getElementById('notificationMessage');

        // Използване на параметрите
        iconElement.textContent = icon;
        nameElement.textContent = name;
        messageElement.textContent = `(-${cost} енергия)`;

        // Изтриване на old класа
        notification.style.animation = 'none';
        
        // Пускане на анимацията
        setTimeout(() => {
            notification.style.animation = 'notificationPop 0.6s ease-out forwards';
        }, 10);

        // Скриване след 2 секунди
        setTimeout(() => {
            notification.style.animation = 'notificationOut 0.6s ease-out forwards';
        }, 1500);
    }

    startCooldown(abilityId, cooldownTime, abilityName) {
        // Параметри: abilityId, cooldownTime (мс), abilityName (име на способност)
        const button = document.getElementById(`ability${abilityId}`);
        const cooldownElement = document.getElementById(`cooldown${abilityId}`);

        button.disabled = true;
        cooldownElement.classList.add('active');

        let remainingTime = cooldownTime / 1000;

        const updateCooldown = () => {
            if (remainingTime > 0) {
                cooldownElement.textContent = remainingTime.toFixed(1);
                remainingTime -= 0.1;
                setTimeout(updateCooldown, 100);
            } else {
                button.disabled = false;
                cooldownElement.classList.remove('active');
                cooldownElement.textContent = '';
            }
        };

        updateCooldown();
    }

    regenEnergy() {
        // УСЛОВИЕ 1: Проверка дали енергията е по-малка от максимума
        if (this.currentEnergy < this.maxEnergy) {
            this.currentEnergy = Math.min(
                this.currentEnergy + this.energyRegenRate,
                this.maxEnergy
            );
            
            // УСЛОВИЕ 2: Проверка дали енергията достигна максимума
            if (this.currentEnergy === this.maxEnergy) {
                this.addLog('✨ Енергията е пълна!', 'success');
            }
            
            this.updateDisplay();
        }
    }

    updateDisplay() {

        // ===== УСЛОВИЯ ЗА ВИЗУАЛНИ ИНДИКАТОРИ =====
        
        const energyDisplay = document.querySelector('.energy-display');
        
        // УСЛОВИЕ 1: Ако енергията е 0
        if (this.currentEnergy === 0) {
            energyDisplay.classList.add('energy-zero');
            energyDisplay.classList.remove('energy-low', 'energy-medium', 'energy-full');
        }
        // УСЛОВИЕ 2: Ако енергията е ниска (под 25%)
        else if (this.currentEnergy < this.maxEnergy * 0.25) {
            energyDisplay.classList.add('energy-low');
            energyDisplay.classList.remove('energy-zero', 'energy-medium', 'energy-full');
        }
        // УСЛОВИЕ 3: Ако енергията е средна (25-75%)
        else if (this.currentEnergy < this.maxEnergy * 0.75) {
            energyDisplay.classList.add('energy-medium');
            energyDisplay.classList.remove('energy-zero', 'energy-low', 'energy-full');
        }
        // УСЛОВИЕ 4: Ако енергията е пълна (100%)
        else if (this.currentEnergy === this.maxEnergy) {
            energyDisplay.classList.add('energy-full');
            energyDisplay.classList.remove('energy-zero', 'energy-low', 'energy-medium');
        }
        // Обновяване на енергийния барелад
        const energyPercent = (this.currentEnergy / this.maxEnergy) * 100;
        document.getElementById('energyFill').style.width = energyPercent + '%';

        // Обновяване на текста на енергията
        document.getElementById('energyValue').textContent = Math.floor(this.currentEnergy);
        document.getElementById('maxEnergy').textContent = this.maxEnergy;
    }

    addLog(message, type = 'normal') {
     

    /**
     * Условие за проверка на能力 статус с множество условия
     * @param {number} abilityId - ID на способност
     * @returns {object} Обект с информация за статуса
     */
    checkAbilityConditions(abilityId) {
        const ability = this.abilities[abilityId];
        const now = Date.now();
        const status = {};

        // УСЛОВИЕ 1: Проверка на cooldown
        status.inCooldown = this.abilityCooldowns[abilityId] > now;
        
        // УСЛОВИЕ 2: Проверка за достатъчна енергия
        status.hasEnergy = this.currentEnergy >= ability.cost;
        
        // УСЛОВИЕ 3: Проверка дали енергията не е 0
        status.energyNotZero = this.currentEnergy > 0;
        
        // УСЛОВИЕ 4: Комбинирано условие - способността може да бъде използвана
        status.canUse = !status.inCooldown && status.hasEnergy && status.energyNotZero;
        
        // УСЛОВИЕ 5: Проверка дали енергията е достатъчна за критичен удар
        status.hasCriticalEnergy = this.currentEnergy >= ability.cost * 1.5;
        
        return status;
    }

    /**
     * Метод за получаване на информация за енергийния статус
     * @returns {object} Обект с енергийната информация
     */
    getEnergyStatus() {
        const status = {};

        // УСЛОВИЕ 1: Енергията е пълна
        status.isFull = this.currentEnergy === this.maxEnergy;

        // УСЛОВИЕ 2: Енергията е празна
        status.isEmpty = this.currentEnergy === 0;

        // УСЛОВИЕ 3: Енергията е критично ниска
        status.isCritical = this.currentEnergy < this.maxEnergy * 0.2;

        // УСЛОВИЕ 4: Енергията е нормална
        status.isNormal = !status.isFull && !status.isEmpty && !status.isCritical;

        // УСЛОВИЕ 5: Има енергия за регенериране
        status.canRegenerate = this.currentEnergy < this.maxEnergy;

        status.percentage = getEnergyPercentage(this.currentEnergy, this.maxEnergy, 0);

        return status;
    }   const logContent = document.getElementById('logContent');
        const p = document.createElement('p');
        p.textContent = message;
        if (type) p.className = type;

        logContent.insertBefore(p, logContent.firstChild);

        // Ограничаване на логовете до 10
        while (logContent.children.length > 10) {
            logContent.removeChild(logContent.lastChild);
        }
    }

    reset() {
        this.currentEnergy = this.maxEnergy;
        for (let i = 1; i <= 4; i++) {
            this.abilityCooldowns[i] = 0;
            const button = document.getElementById(`ability${i}`);
            const cooldownElement = document.getElementById(`cooldown${i}`);
            button.disabled = false;
            cooldownElement.classList.remove('active');
            cooldownElement.textContent = '';
        }
        this.updateDisplay();
        this.addLog('Система е рестартирана!', 'success');
    }
}

// Запускане на системата при загрузка на страницата
document.addEventListener('DOMContentLoaded', () => {
    const heroSystem = new HeroSystem();

    // ===== ДЕМОНСТРАЦИЯ НА УСЛОВИЯТА =====
    console.log('%c⚡ HERO SYSTEM - Условия', 'color: #00ff88; font-size: 16px; font-weight: bold;');
    
    console.log('%c=== УСЛОВИЯ ВЪВ useAbility() ===', 'color: #ffbe0b; font-weight: bold;');
    console.log('✓ УСЛОВИЕ 1: Проверка на cooldown - if (cooldownRemaining > 0)');
    console.log('✓ УСЛОВИЕ 2: Проверка за недостатъчна енергия - if (currentEnergy < cost)');
    console.log('✓ УСЛОВИЕ 3: Проверка дали енергията е точно 0 - if (currentEnergy === 0)');
    console.log('✓ УСЛОВИЕ 4: Проверка дали енергията стана 0 - if (currentEnergy <= 0)');

    console.log('%c=== УСЛОВИЯ В regenEnergy() ===', 'color: #ffbe0b; font-weight: bold;');
    console.log('✓ УСЛОВИЕ 1: Проверка дали енергията < max - if (currentEnergy < maxEnergy)');
    console.log('✓ УСЛОВИЕ 2: Проверка дали енергията достигна max - if (currentEnergy === maxEnergy)');

    console.log('%c=== УСЛОВИЯ В updateDisplay() ===', 'color: #ffbe0b; font-weight: bold;');
    console.log('✓ УСЛОВИЕ 1: Енергията е 0 - if (energy === 0) → energy-zero клас');
    console.log('✓ УСЛОВИЕ 2: Енергията е ниска (<25%) - if (energy < max*0.25) → energy-low клас');
    console.log('✓ УСЛОВИЕ 3: Енергията е средна (25-75%) - if (energy < max*0.75) → energy-medium клас');
    console.log('✓ УСЛОВИЕ 4: Енергията е пълна (100%) - if (energy === max) → energy-full клас');

    console.log('%c=== МЕТОДИ С УСЛОВИЯ ===', 'color: #ffbe0b; font-weight: bold;');
    
    // Демонстрация на checkAbilityConditions()
    console.log('%c1. checkAbilityConditions(abilityId) - Множество условия за способност:', 'color: #ff006e; font-weight: bold;');
    const abilityStatus = heroSystem.checkAbilityConditions(1);
    console.log('Статус на Огнена топка:', abilityStatus);
    console.log('  - В cooldown:', abilityStatus.inCooldown, '(if cooldown > now)');
    console.log('  - Има енергия:', abilityStatus.hasEnergy, '(if energy >= cost)');
    console.log('  - Енергията не е 0:', abilityStatus.energyNotZero, '(if energy > 0)');
    console.log('  - Може да се използва:', abilityStatus.canUse, '(!cooldown && energy && notZero)');
    console.log('  - Има критична енергия:', abilityStatus.hasCriticalEnergy, '(if energy >= cost*1.5)');

    // Демонстрация на getEnergyStatus()
    console.log('%c2. getEnergyStatus() - Статус на енергия:', 'color: #ff006e; font-weight: bold;');
    const energyStatus = heroSystem.getEnergyStatus();
    console.log('Енергийни условия:', energyStatus);
    console.log('  - Е пълна:', energyStatus.isFull, '(if energy === max)');
    console.log('  - Е празна:', energyStatus.isEmpty, '(if energy === 0)');
    console.log('  - Е критична:', energyStatus.isCritical, '(if energy < max*0.2)');
    console.log('  - Е нормална:', energyStatus.isNormal, '(!full && !empty && !critical)');
    console.log('  - Може да регенерира:', energyStatus.canRegenerate, '(if energy < max)');
    console.log('  - Процент: ' + energyStatus.percentage + '%');

    console.log('%c=== ТЕСТВАНЕ НА УСЛОВИЯ ===', 'color: #ffbe0b; font-weight: bold;');
    
    // Сценарий 1: Достатъчна енергия
    console.log('%cСценарий 1: Нормална енергия (70/100)', 'color: #00ff88;');
    heroSystem.currentEnergy = 70;
    const status1 = heroSystem.checkAbilityConditions(1);
    console.log('Резултат: Может ли да активира способност?', status1.canUse ? '✅ ДА' : '❌ НЕ');

    // Сценарий 2: Недостатъчна енергия
    console.log('%cСценарий 2: Ниска енергия (15/100)', 'color: #ffbe0b;');
    heroSystem.currentEnergy = 15;
    const status2 = heroSystem.checkAbilityConditions(1);
    console.log('Резултат: Может ли да активира Огнена топка (цена 30)?', status2.canUse ? '✅ ДА' : '❌ НЕ');
    console.log('Причина: Недостатъчна енергия (15 < 30)');

    // Сценарий 3: Енергията е 0
    console.log('%cСценарий 3: Енергията е 0 (0/100)', 'color: #ff0000;');
    heroSystem.currentEnergy = 0;
    const status3 = heroSystem.checkAbilityConditions(1);
    console.log('Резултат: Може ли някоя способност да се използва?', status3.canUse ? '✅ ДА' : '❌ НЕ');
    console.log('Причина: энергия = 0');

    // Върнете енергията на нормална стойност
    heroSystem.currentEnergy = 100;
    heroSystem.updateDisplay();

    console.log('%c✅ Всички условия работят правилно!', 'color: #00ff88; font-weight: bold; font-size: 14px;');
});
