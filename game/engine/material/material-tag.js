import { default as Tag } from '@core/tag'

export default class Material extends Tag {
    static tagType = 'Material'
    constructor() {
      super();
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('MaterialComponent');
    };

    getMaterialType() {
        return this.entity.getComponent('MaterialComponent').materialType
    }
  }
  