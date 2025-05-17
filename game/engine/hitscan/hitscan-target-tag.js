import { default as Tag } from '@core/tag'

export default class HitscanTarget extends Tag {
    static tagType = 'HitscanTarget'

    constructor() {
      super();
      this.tagType = 'HitscanTarget'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('HitscanTargetComponent');
    };
    
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }
  
    getWidth() {
      return this.entity.getComponent('PositionComponent').width;
    }
  
    getHeight() {
      return this.entity.getComponent('PositionComponent').height;
    }
  }
  