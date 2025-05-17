import { default as System } from '@core/system';

export default class DebugLightMovementSystem extends System {
    constructor() {
        super();
        this.direction = 1;
    }

    work() {
        this.workForTag('Lightable', (lightable, entity) => {
            if (entity.key == 'point') {
                if (entity.getComponent('PositionComponent').yPosition == 120) {
                    this.direction = 1;
                }
                else if (entity.getComponent('PositionComponent').yPosition == 700) {
                    this.direction = -1;
                }
                entity.getComponent('PositionComponent').yPosition += 2 * this.direction;
            }
            else if (lightable.getLightType() == 'cone') {
                entity.getComponent('PositionComponent').angleDegrees += 1;
            }
        })
    }
} 