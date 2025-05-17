import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import CollisionComponent from '@game/engine/collision/collision-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import AiComponent from '@game/engine/ai/ai-component';
import MaterialComponent from '@game/engine/material/material-component';
import HealthComponent from './health-component';


export default class DamageSystem extends System {
    constructor() {
        super()

        this.addHandler('REQUEST_DAMAGE', (payload) => {
            this._damage(payload.entity, payload.amount, payload.onDamage);
        })
    }

    work() {

    }

    _damage(entity, amount, onDamage) {
        this.workForEntityWithTag(entity.id, 'Damageable', (entity, tag) => {
            if (tag.isInvulnerable()) {
                return;
            }

            tag.damage(amount);
            if (onDamage) {
                onDamage();
            }
            if (amount > 0) {
                tag.onHealthLoss();
            }

            if (tag.isHealthZero()) {
                tag.onHealthZero();
            }
        });
    }
}
