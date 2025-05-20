import { default as Tag } from '@core/tag';

export default class TrailZone extends Tag {
    static tagType = 'TrailZone';

    constructor() {
        super();
        this.tagType = 'TrailZone';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('TrailZoneComponent') && entity.getComponent('PositionComponent');
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }
} 