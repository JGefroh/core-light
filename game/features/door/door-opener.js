import { default as Tag } from '@core/tag'

export default class DoorOpener extends Tag{
  static tagType = 'DoorOpener'

    constructor() {
        super()
        this.tagType = 'DoorOpener'
    }

    static isAssignableTo(entity) {
      return entity.hasLabel('DoorOpener') && entity.getComponent('PositionComponent');
    };
    
    getYPosition() {
      return this.entity.hasComponent('PositionComponent').yPosition;
    }

    getXPosition() {
      return this.entity.hasComponent('PositionComponent').xPosition;
    }
  }
  