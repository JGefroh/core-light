import { default as Tag } from '@core/tag';

export default class TrailGenerator extends Tag {
    static tagType = 'TrailGenerator';

    constructor() {
        super();
        this.tagType = 'TrailGenerator';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('TrailGeneratorComponent') && entity.getComponent('PositionComponent');
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }
} 