import { default as Tag } from '@core/tag';

export default class Damageable extends Tag {
    static tagType = 'Damageable';

    constructor() {
        super();
        this.tagType = 'Damageable';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('HealthComponent');
    }

    damage(amount) {
        this.entity.getComponent('HealthComponent').health -= amount;
        this.entity.getComponent('HealthComponent').lastDamagedTimestamp = Date.now()
    }

    getHealth() {
        return this.entity.getComponent('HealthComponent').health;
    }

    isHealthZero() {
        return this.entity.getComponent('HealthComponent').health <= 0;
    }

    onHealthLoss() {
        this.entity.getComponent('HealthComponent').onHealthLoss(this.entity, this.getHealth());
    }

    onHealthZero() {
        this.entity.getComponent('HealthComponent').onHealthZero(this.entity, this.getHealth());
    }

    isInvulnerable() {
        let healthComponent = this.entity.getComponent('HealthComponent');
        if (healthComponent.postDamageInvincibilityMs && (Date.now() < (healthComponent.lastDamagedTimestamp + healthComponent.postDamageInvincibilityMs))) {
            return true;
        }
        return false;
    }
} 