import { default as Tag } from '@core/tag'

export default class AudioListener extends Tag{
  static tagType = 'AudioListener'

    constructor() {
        super()
        this.tagType = 'AudioListener'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('AudioListenerComponent');
    };

    getYPosition() {
      return this.entity.hasComponent('PositionComponent').yPosition;
    }

    getXPosition() {
      return this.entity.hasComponent('PositionComponent').xPosition;
    }
  }
  