import { default as Component } from '@core/component';

export default class HealthComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'HealthComponent';

        this.health = payload.health || 100;
        this.healthMax = payload.healthMax || 100;

        this.postDamageInvincibilityMs = payload.postDamageInvincibilityMs || 0;
        this.lastDamagedTimestamp = new Date();

        // Callbacks
        this.onHealthLoss = payload.onHealthLoss || (() => {});
        this.onHealthZero = payload.onHealthZero || (() => {});
    }
} 