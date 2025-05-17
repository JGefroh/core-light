import { default as Tag } from '@core/tag'

export default class HasFootsteps extends Tag{
  static tagType = 'HasFootsteps'

    constructor() {
        super()
        this.tagType = 'HasFootsteps'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('FootstepFxComponent') && entity.hasComponent('VectorComponent');
    };

    isMoving() {
      return this.entity.getComponent('VectorComponent').hasVector();
    }
  }
  