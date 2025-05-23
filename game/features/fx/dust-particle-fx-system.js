import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

export default class DustParticleFxSystem extends System {
    constructor() {
        super()
        this.addHandler('REQUEST_DUST_FX', (payload) => {
            if (payload.entity) {
                this.addDustForEntity(payload.entity, payload)
            }
            else {
                this.addDustAtPosition(payload.xPosition, payload.yPosition, payload.angleDegrees)
            }
        });
    }

    work() {
    }

    addDustForEntity(entity, options = {}) {
        if (!entity) {
            return;
        }
        let position = entity?.getComponent('PositionComponent')
        if (!position) {
            return;
        }

        this.addDustAtPosition(position.xPosition, position.yPosition, position.angleDegrees, options)
    }

    addDustAtPosition(xPosition, yPosition, angleDegrees, options = {}) {
        this._core.send('EMIT_PARTICLES', {
            xPosition: xPosition,
            yPosition: yPosition,
            particleEmitFrequencyInMs: 0,
            particleEmissionCyclesMax: options.particleEmissionCyclesMax || 1,
            particleShape: 'circle',
            particleCount: options.particleCount || 10,
            particleLifetimeMin: 45000,
            particleLifetimeMax: 60000,
            particleHeightMin: 0.2, //0.08 is pretty much the smallest
            particleHeightMax: 0.4,
            particleWidthMin: 0.2,
            particleWidthMax: 0.4,
            particleColors: [`rgba(255, 255, 255, ${Math.random()})`],
            particleSpeedMin: 0.1,
            particleSpeedMax: 20,
            particleEmissionAngleDegreesMin: options.respectAngle ? angleDegrees - 10 : 0,
            particleEmissionAngleDegreesMax: options.respectAngle ? angleDegrees + 10 : 360,
            particleSpawnRadius: options.spawnRadius || 30,
          });
    }
}

