import { default as System } from '@core/system';
import { areRectanglesColliding, isCircleCollidingWithRotatedRect } from './collision-util';

export default class CollisionSystem extends System {
  constructor() {
    super();
    this.collidablesByCollisionGroup = {};
    this.collidables = {};
  }

  work() {
    this.checkCount = 0;

    this.collidables = this._core.getData('CONFIG_COLLISION_GROUPS') || [];
    if (!this.collidables) return;

    this.collidablesByCollisionGroup = this.getAndCacheCollidables();

    for (const [groupA, targets] of Object.entries(this.collidables)) {
      for (const groupB of targets) {
        this.checkCollisionBetweenGroups(this.collidablesByCollisionGroup, groupA, groupB);
      }
    }
  }

  getAndCacheCollidables() {
    const map = {};
    this.workForTag('Collidable', (tag, entity) => {
      const group = tag.getCollisionGroup();
      if (!map[group]) map[group] = [];
      map[group].push(entity);
    });
    return map;
  }

  checkCollisionBetweenGroups(groups, groupName1, groupName2) {
    const shot = this.getTag('Collidable');
    const target = this.getTag('Collidable');

    (groups[groupName1] || []).forEach(entity1 => {
      if (!entity1.id) {
        return;
      }
      shot.setEntity(entity1);
      let skipX = false;
      let skipY = false;

      (groups[groupName2] || []).forEach(entity2 => {
        if (!entity2.id) {
          return;
        }
        if (skipX && skipY) return;

        target.setEntity(entity2);
        if (!entity1?.id || !entity2?.id || !this._checkShouldCheck(shot, target)) return;

        if (!skipX) {
          const collidedX = this._checkCollided(
            shot.getXPositionProposed(), shot.getYPosition(),
            shot,
            target.getXPosition(), target.getYPosition(),
            target
          );
          if (collidedX) {
            shot.setXPositionProposalValid(false);
            skipX = true;
          }
        }

        if (!skipY) {
          const collidedY = this._checkCollided(
            shot.getXPosition(), shot.getYPositionProposed(),
            shot,
            target.getXPosition(), target.getYPosition(),
            target
          );
          if (collidedY) {
            shot.setYPositionProposalValid(false);
            skipY = true;
          }
        }

        if (skipX || skipY) {
          this.executeCollisionEffect(shot, target);
        }
      });
    });
  }

  executeCollisionEffect(collidable1, collidable2) {
    collidable1.onCollision(collidable2);
    collidable2.onCollision(collidable1);
  }

  _checkShouldCheck(c1, c2) {
    if (c1.getId() === c2.getId()) return false;
    if (!c1.getEntity() || !c2.getEntity()) return false;

    const groupA = c1.getCollisionGroup() || 'default';
    const groupB = c2.getCollisionGroup() || 'default';
    if (!this.collidables[groupA]?.includes(groupB)) return false;

    const maxDelta = Math.max(c1.getWidth(), c1.getHeight(), c2.getWidth(), c2.getHeight());
    const dx = Math.abs(c1.getXPosition() - c2.getXPosition());
    const dy = Math.abs(c1.getYPosition() - c2.getYPosition());
    if (dx > maxDelta && dy > maxDelta) return false;

    return true;
  }

  _checkCollided(x1, y1, c1, x2, y2, c2, axisLimit = null) {
    const shape1 = c1.getCollisionShape();
    const shape2 = c2.getCollisionShape();
  
    try {
      this.checkCount++;
  
      if (shape1 === 'rectangle' && shape2 === 'rectangle') {
        return areRectanglesColliding(
          x1 - (c1.getWidth() / 2), y1 - (c1.getHeight() / 2),
          c1.getWidth(), c1.getHeight(), c1.getAngleDegrees(),
          x2 - (c2.getWidth() / 2), y2 - (c2.getHeight() / 2),
          c2.getWidth(), c2.getHeight(), c2.getAngleDegrees(),
          axisLimit
        );
      }
  
      // Circle vs Rectangle (assume c1 is the circle)
      if (shape1 === 'circle' && shape2 === 'rectangle') {
        return isCircleCollidingWithRotatedRect({
          x: x1,
          y: y1,
          radius: c1.getWidth() / 2 // Assuming width == height
        }, {
          x: x2,
          y: y2,
          width: c2.getWidth(),
          height: c2.getHeight(),
          angleDegrees: c2.getAngleDegrees()
        });
      }
  
      // Rectangle vs Circle (flip order)
      if (shape1 === 'rectangle' && shape2 === 'circle') {
        return isCircleCollidingWithRotatedRect({
          x: x2,
          y: y2,
          radius: c2.getWidth() / 2
        }, {
          x: x1,
          y: y1,
          width: c1.getWidth(),
          height: c1.getHeight(),
          angleDegrees: c1.getAngleDegrees()
        });
      }
      if (shape1 === 'circle' && shape2 === 'circle') {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distanceSq = dx * dx + dy * dy;
        const radius1 = c1.getWidth() / 2;
        const radius2 = c2.getWidth() / 2;
        const combined = radius1 + radius2;
        return distanceSq <= combined * combined;
      }
  
      // Not supported
      return false;
  
    } catch {
      return false;
    }
  }
}