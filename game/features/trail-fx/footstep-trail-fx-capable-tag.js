import { default as Tag } from '@core/tag';

export default class FootstepTrailFxCapable extends Tag {
    static tagType = 'FootstepTrailFxCapable';

    constructor() {
        super();
        this.tagType = 'FootstepTrailFxCapable';
    }

    static isAssignableTo(entity) {
        return entity.hasLabel('FootstepTrailFxCapable') && entity.getComponent('PositionComponent');
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
} 