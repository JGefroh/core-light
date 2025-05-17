import { default as Tag } from '@core/tag';

export default class Shadow extends Tag {
    static tagType = 'Shadowable';

    constructor() {
        super();
        this.tagType = 'Shadowable';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('ShadowComponent')
    }

    getRectangleEdgesCache() {
        return this.entity.getComponent('ShadowComponent').rectangleEdgesCache;
    }

    setRectangleEdgesCache(edges) {
        this.entity.getComponent('ShadowComponent').rectangleEdgesCache = edges;
    }
} 