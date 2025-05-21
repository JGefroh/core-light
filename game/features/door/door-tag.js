import { default as Tag } from '@core/tag'

export default class Door extends Tag{
  static tagType = 'Door'

    constructor() {
        super()
        this.tagType = 'Door'
    }

    static isAssignableTo(entity) {
      return entity.hasLabel('Door') && entity.getComponent('PositionComponent');
    };

    getYPosition() {
      return this.entity.hasComponent('PositionComponent').yPosition;
    }

    getXPosition() {
      return this.entity.hasComponent('PositionComponent').xPosition;
    }
  }
  