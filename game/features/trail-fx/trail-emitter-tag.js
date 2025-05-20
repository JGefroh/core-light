import { default as Tag } from '@core/tag';

export default class TrailEmitter extends Tag {
    static tagType = 'TrailEmitter';

    constructor() {
        super();
        this.tagType = 'TrailEmitter';
    }

    static isAssignableTo(entity) {
        return entity.getComponent('TrailEmitterComponent') && entity.getComponent('PositionComponent');
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }
    
    getAngleDegrees() {
        return this.entity.getComponent('PositionComponent').angleDegrees;
    }

    setTrailRemaining(trailRemaining) {
        this.entity.getComponent('TrailEmitterComponent').trailRemaining = trailRemaining;
    }

    getTrailRemaining() {
        return this.entity.getComponent('TrailEmitterComponent').trailRemaining;
    }

    isTimeToAddTrail() {
        return this.entity.getComponent('TrailEmitterComponent').lastTrailTimestamp + this.entity.getComponent('TrailEmitterComponent').trailFrequencyMs <= Date.now();
    }

    didPositionChange() {
        return (this.entity.getComponent('PositionComponent').xPosition != this.entity.getComponent('PositionComponent').lastXPosition) || 
        (this.entity.getComponent('PositionComponent').yPosition != this.entity.getComponent('PositionComponent').lastYPosition)
    }

    updateTrailStats() {
        this.entity.getComponent('TrailEmitterComponent').lastTrailTimestamp = Date.now();
        this.entity.getComponent('TrailEmitterComponent').trailRemaining--;
    }
} 