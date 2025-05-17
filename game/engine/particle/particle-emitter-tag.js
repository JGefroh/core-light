import { default as Tag } from '@core/tag';

export default class ParticleEmitter extends Tag {
    static tagType = 'ParticleEmitter';

    constructor() {
        super();
        this.tagType = 'ParticleEmitter';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('PositionComponent') && entity.hasComponent('ParticleEmitterComponent');
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }

    getAngleDegrees() {
        return this.entity.getComponent('PositionComponent').angleDegrees
    }

    getEmitterDetails() {
        return this.entity.getComponent('ParticleEmitterComponent')
    }

    incrementParticleEmissionCyclesCurrent() {
        this.entity.getComponent('ParticleEmitterComponent').particleEmissionCyclesCurrent++;
    }
} 