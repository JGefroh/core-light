import { default as Tag } from '@core/tag'

export default class TurnsTowards extends Tag {
    static tagType = 'TurnsTowards'
    constructor() {
      super();
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('TurnsTowardsComponent') && entity.hasComponent('PositionComponent');
    };

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }

    setAngleDegrees(angleDegrees) {
      return this.entity.getComponent('PositionComponent').angleDegrees = angleDegrees;
    }

    getAngleDegrees() {
      return this.entity.getComponent('PositionComponent').angleDegrees || 0;
    }

    getOriginalAngleDegrees() {
      return this.entity.getComponent('PositionComponent').originalAngleDegrees || 0;
    }

    getTurnSpeed() {
      return this.entity.getComponent('TurnsTowardsComponent').turnSpeed;
    }

    getTurnTarget() {
      return this.entity.getComponent('TurnsTowardsComponent').turnTarget;
    }
  }
  