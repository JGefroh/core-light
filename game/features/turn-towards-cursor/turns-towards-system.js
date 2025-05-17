import { default as System } from '@core/system';

export default class TurnsTowardsSystem extends System {
    constructor() {
      super()
      this.mouseXPosition = null;
      this.mouseYPosition = null;

      this._core.addHandler("INPUT_RECEIVED", (payload) => {
        if (payload.type == 'cursor_position') {
          this.mouseXPosition = payload.world.xPosition;
          this.mouseYPosition = payload.world.yPosition;
        }
      });
    }
  
    work() {
      this._turnTowardsCursor();
    };

    _turnTowardsCursor() {
      if (!this.mouseXPosition && !this.mouseYPosition) {
        return;
      }
      let tag = this.getTag('TurnsTowards');
      this.forTaggedAs('TurnsTowards', (entity) => {
        tag.setEntity(entity);
        let targetXPosition = null;
        let targetYPosition = null;
        if (tag.getTurnTarget() == 'mouse') {
          let cursorCoordinates = {world: {xPosition: this.mouseXPosition, yPosition: this.mouseYPosition}};
          if (!cursorCoordinates) { return 0; }
          targetXPosition = cursorCoordinates.world.xPosition
          targetYPosition = cursorCoordinates.world.yPosition
        }
        else {
          let target = this._core.getEntityWithId(tag.getTurnTarget())
          if (!target) {
            return;
          }

          targetXPosition = target.getComponent('PositionComponent').xPosition;
          targetYPosition = target.getComponent('PositionComponent').yPosition;
        }
        
        let turnAmount = this._calculateClampedTurnAmount(tag, targetXPosition, targetYPosition)

        tag.setAngleDegrees(turnAmount);
        this.mouseXPosition = null;
        this.mouseYPosition = null;
      });
    }

    _calculateClampedTurnAmount(tag, targetXPosition, targetYPosition) {
      let intendedAngleDegrees = this._calculateAngleDegreesTo(tag.getXPosition(), tag.getYPosition(), targetXPosition, targetYPosition)
      let originalAngleDegrees = tag.getOriginalAngleDegrees()
      let currentAngleDegrees = tag.getAngleDegrees();

      let delta = (intendedAngleDegrees - currentAngleDegrees + 360) % 360 ;

      // Calculate the shortest angle between intendedAngleDegrees and currentAngleDegrees
      if (delta > 180) {
        delta -= 360;
      } else if (delta < -180) {
        delta += 360;
      }

      let turnAmount = tag.getTurnSpeed();
      if (Math.abs(delta) < turnAmount) {
        return intendedAngleDegrees;
      } else {
        return (currentAngleDegrees + Math.sign(delta) * turnAmount);
      }
    }

    _getAngleDegreesOffset(entity) {
      let attachedComponent = entity.getComponent('AttachedComponent')
      if (!attachedComponent) {
        return intendedAngleDegrees;
      }

      return attachedComponent.attachedToEntity.getComponent('PositionComponent').angleDegrees
    }

    _calculateAngleDegreesTo(xPosition, yPosition, targetXPosition, targetYPosition) {
      let adjacent = targetXPosition - xPosition;
      let opposite = targetYPosition - yPosition;
      
      let angleDegrees = Math.atan2(opposite, adjacent) * 180 / Math.PI;

      if (angleDegrees < 0) {
        angleDegrees += 360;
      } else if (angleDegrees >= 360) {
          angleDegrees -= 360;
      }
      return angleDegrees;
    }

    _clampAngleDegrees(originalBearing, intendedAngleDegrees, allowedDegrees) {
      let sum = (originalBearing + intendedAngleDegrees) % 360;
      if (sum >= allowedDegrees) {
          // If the sum is greater than or equal to allowedDegrees,
          // we need to clamp the intendedAngleDegrees.
          // Calculate the difference between sum and allowedDegrees
          let diff = sum - allowedDegrees;
          // Adjust intendedAngleDegrees accordingly
          return intendedAngleDegrees - diff;
      } else {
          // If the sum is within the allowed range, return intendedAngleDegrees unchanged.
          return intendedAngleDegrees;
      }
    }
  }
  