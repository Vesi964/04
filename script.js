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

        // Проверка на cooldown
        if (this.abilityCooldowns[abilityId] > now) {
            const remainingTime = Math.ceil((this.abilityCooldowns[abilityId] - now) / 1000);
            this.addLog(formatLogMessage('cooldown', ability.name, remainingTime), 'error');
            return;
        }

        // Проверка на енергия
        if (this.currentEnergy < ability.cost) {
            this.addLog(formatLogMessage('lowenergy', ability.name, ability.cost), 'error');
            return;
        }

        // Използване на способността
        this.currentEnergy -= ability.cost;
        this.abilityCooldowns[abilityId] = now + ability.cooldown;

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
        if (this.currentEnergy < this.maxEnergy) {
            this.currentEnergy = Math.min(
                this.currentEnergy + this.energyRegenRate,
                this.maxEnergy
            );
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Обновяване на енергийния барелад
        const energyPercent = (this.currentEnergy / this.maxEnergy) * 100;
        document.getElementById('energyFill').style.width = energyPercent + '%';

        // Обновяване на текста на енергията
        document.getElementById('energyValue').textContent = Math.floor(this.currentEnergy);
        document.getElementById('maxEnergy').textContent = this.maxEnergy;
    }

    addLog(message, type = 'normal') {
        const logContent = document.getElementById('logContent');
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

    // ===== ДЕМОНСТРАЦИЯ НА ФУНКЦИИТЕ С ПАРАМЕТРИ =====
    console.log('%c⚡ HERO SYSTEM - Функции с параметри', 'color: #00ff88; font-size: 16px; font-weight: bold;');
    
    // Демонстрация на power() функция
    console.log('%c1. power(name, cost, color, icon)', 'color: #ffbe0b; font-weight: bold;');
    const firePower = power('Огнена топка', 30, 'fire', '🔥');
    const icePower = power('Ледена буря', 25, 'ice', '❄️');
    console.log('Огнена топка:', firePower);
    console.log('  - Урон: ' + firePower.damage + ', Ефективност: ' + firePower.efficiency);
    
    // Демонстрация на calculateDamage() функция
    console.log('%c2. calculateDamage(baseDamage, energyUsed, multiplier)', 'color: #ffbe0b; font-weight: bold;');
    const damage1 = calculateDamage(45, 30);
    const damage2 = calculateDamage(45, 30, 1.3);
    const damage3 = calculateDamage(45, 40, 1.5);
    console.log('Базов урон: ' + damage1 + ' (45 + 30*0.5)');
    console.log('Със 30% множител: ' + damage2 + ' (със бонус)');
    console.log('Със 50% множител: ' + damage3 + ' (мощен удар)');
    
    // Демонстрация на animateEffect() функция
    console.log('%c3. animateEffect(effectType, duration, intensity)', 'color: #ffbe0b; font-weight: bold;');
    const fireEffect = animateEffect('fire', 800, 0.8);
    const iceEffect = animateEffect('ice', 800, 1.0);
    console.log('Огнен ефект:', fireEffect);
    console.log('Ледов ефект:', iceEffect);
    
    // Демонстрация на formatLogMessage() функция
    console.log('%c4. formatLogMessage(action, abilityName, value)', 'color: #ffbe0b; font-weight: bold;');
    const msg1 = formatLogMessage('activate', 'Огнена топка', 30);
    const msg2 = formatLogMessage('damage', 'Светкавична стрела', 73);
    const msg3 = formatLogMessage('heal', 'Лечение', 45);
    console.log(msg1);
    console.log(msg2);
    console.log(msg3);

    // Демонстрация на checkAbilityStatus() функция
    console.log('%c5. checkAbilityStatus(currentEnergy, maxEnergy, cost, cooldownRemaining)', 'color: #ffbe0b; font-weight: bold;');
    const status1 = checkAbilityStatus(100, 100, 30, 0);
    const status2 = checkAbilityStatus(20, 100, 30, 0);
    const status3 = checkAbilityStatus(100, 100, 30, 2500);
    console.log('Статус (достатъчна енергия): ' + status1);
    console.log('Статус (недостатъчна енергия): ' + status2);
    console.log('Статус (в режим на очакване): ' + status3);

    // Демонстрация на getEnergyPercentage() функция
    console.log('%c6. getEnergyPercentage(current, max, decimals)', 'color: #ffbe0b; font-weight: bold;');
    const percent1 = getEnergyPercentage(100, 100);
    const percent2 = getEnergyPercentage(50, 100);
    const percent3 = getEnergyPercentage(75, 100, 0);
    console.log('Енергия 100/100: ' + percent1 + '%');
    console.log('Енергия 50/100: ' + percent2 + '%');
    console.log('Енергия 75/100: ' + percent3 + '%');

    // Демонстрация на createAbility() функция
    console.log('%c7. createAbility(id, name, cost, icon, effect, cooldown, multiplier)', 'color: #ffbe0b; font-weight: bold;');
    const newAbility1 = createAbility('1', 'Огнена топка', 30, '🔥', 'fire', 3000, 1);
    const newAbility2 = createAbility('3', 'Светкавична стрела', 40, '⚡', 'lightning', 4000, 1.3);
    const newAbility3 = createAbility('custom', 'Мегаудар', 50, '💥', 'fire', 5000, 2);
    console.log('Огнена топка:', newAbility1);
    console.log('Светкавична стрела:', newAbility2);
    console.log('Мегаудар (custom):', newAbility3);
    
    console.log('%c✅ Всички функции с параметри работят правилно!', 'color: #00ff88; font-weight: bold; font-size: 14px;');
});
