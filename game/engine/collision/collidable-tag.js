import { default as Tag } from '@core/tag'

export default class Collidable extends Tag {
    static tagType = 'Collidable'

    constructor() {
      super();
      this.tagType = 'Collidable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('CollisionComponent');
    };

    getCollisionShape() {
      return this.entity.getComponent('CollisionComponent').collisionShape;
    }

    getCollisionGroup() {
      return this.entity.getComponent('CollisionComponent').collisionGroup;
    }

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition
    }

    getWidth() {
      return this.entity.getComponent('PositionComponent').width;
    }

    getHeight() {
      return this.entity.getComponent('PositionComponent').height;
    }

    getAngleDegrees() {
      return this.entity.getComponent('PositionComponent').angleDegrees;
    }

    setXPositionProposalValid(xValid) {
      this.entity.getComponent('PositionComponent').xPositionProposedValid = xValid
    }

    setYPositionProposalValid(yValid) {
      this.entity.getComponent('PositionComponent').yPositionProposedValid = yValid
    }

    getXPositionProposed() {
      return this.entity.getComponent('PositionComponent').xPositionProposed
    }

    getYPositionProposed() {
      return this.entity.getComponent('PositionComponent').yPositionProposed;
    }

    onCollision(collidable) {
      if (!this.entity?.getComponent('CollisionComponent')) {
        return;
      }
      return this.entity?.getComponent('CollisionComponent').onCollision(collidable);
    }
  }
  