// HERO SYSTEM - Управление на способностите и енергията

class HeroSystem {
    constructor() {
        this.maxEnergy = 100;
        this.currentEnergy = 100;
        this.energyRegenRate = 1; // енергия за секунда
        this.abilities = {
            1: { name: 'Огнена топка', cost: 30, cooldown: 3000, icon: '🔥', color: '#ff3333' },
            2: { name: 'Ледена буря', cost: 25, cooldown: 2500, icon: '❄️', color: '#3399ff' },
            3: { name: 'Светкавична стрела', cost: 40, cooldown: 4000, icon: '⚡', color: '#ffff33' },
            4: { name: 'Лечение', cost: 20, cooldown: 2000, icon: '💚', color: '#33ff66' }
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
            this.addLog(`${ability.name} е в режим на очакване! Остават ${remainingTime}с.`, 'error');
            return;
        }

        // Проверка на енергия
        if (this.currentEnergy < ability.cost) {
            this.addLog(`Недостатъчна енергия! Нужна: ${ability.cost}, текуща: ${this.currentEnergy}`, 'error');
            return;
        }

        // Използване на способността
        this.currentEnergy -= ability.cost;
        this.abilityCooldowns[abilityId] = now + ability.cooldown;

        this.addLog(`✨ ${ability.name} е активирана! (-${ability.cost} енергия)`, 'success');

        // Специални ефекти за всяка способност
        this.triggerAbilityEffect(abilityId);

        // Визуален ефект - промяна на цветовете
        this.triggerColorEffect(abilityId);

        // Обновяване на дисплея
        this.updateDisplay();
        this.startCooldown(abilityId);
    }

    triggerAbilityEffect(abilityId) {
        const effects = {
            1: () => this.addLog('🔥 Огнена топка нанесе 40 урона!'),
            2: () => this.addLog('❄️ Враг е замразен за 3 секунди!'),
            3: () => this.addLog('⚡ Светкавична стрела нанесе 50 урона!'),
            4: () => this.addLog('💚 Възстановени 30 HP!')
        };
        effects[abilityId]();
    }

    triggerColorEffect(abilityId) {
        const container = document.querySelector('.container');
        const abilities = {
            1: { color: 'fire', duration: 800 },      // Огнена топка - червено
            2: { color: 'ice', duration: 800 },        // Ледена буря - синьо
            3: { color: 'lightning', duration: 800 },  // Светкавица - жълто
            4: { color: 'heal', duration: 800 }        // Лечение - зелено
        };

        const effect = abilities[abilityId];
        
        // Добавяне на клас за ефект
        container.classList.add(`effect-${effect.color}`);

        // Отстраняване на класа след времето
        setTimeout(() => {
            container.classList.remove(`effect-${effect.color}`);
        }, effect.duration);

        // Показване на notification
        this.showAbilityNotification(abilityId);
    }

    showAbilityNotification(abilityId) {
        const ability = this.abilities[abilityId];
        const notification = document.getElementById('abilityNotification');
        const icon = document.getElementById('notificationIcon');
        const name = document.getElementById('notificationName');
        const message = document.getElementById('notificationMessage');

        icon.textContent = ability.icon;
        name.textContent = ability.name;
        message.textContent = `(-${ability.cost} енергия)`;

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

    startCooldown(abilityId) {
        const button = document.getElementById(`ability${abilityId}`);
        const cooldownElement = document.getElementById(`cooldown${abilityId}`);
        const cooldownTime = this.abilities[abilityId].cooldown;

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
});
