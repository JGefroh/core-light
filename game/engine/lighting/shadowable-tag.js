import { default as Tag } from '@core/tag';

export default class Shadow extends Tag {
    static tagType = 'Shadowable';

    constructor() {
        super();
        this.tagType = 'Shadowable';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('ShadowComponent') && entity.hasComponent('PositionComponent')
    }

    getRectangleEdgesCache() {
        return this.entity.getComponent('ShadowComponent').rectangleEdgesCache;
    }

    setRectangleEdgesCache(edges) {
        this.entity.getComponent('ShadowComponent').rectangleEdgesCache = edges;
    }
    
    getWidth() {
        return this.entity.getComponent('PositionComponent').width;
    }

    getHeight() {
        return this.entity.getComponent('PositionComponent').height;
    }

    getXPosition() {
        return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
        return this.entity.getComponent('PositionComponent').yPosition;
    }
} 