import { default as Tag } from '@core/tag'

export default class Movable extends Tag{
  static tagType = 'Movable'

    constructor() {
        super()
        this.tagType = 'Movable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('VectorComponent');
    };
  
    setXPosition(xPosition) {
      this.entity.getComponent('PositionComponent').lastXPosition = this.entity.getComponent('PositionComponent').xPosition;
      this.entity.getComponent('PositionComponent').xPosition = xPosition;
    };
  
    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    };
  
    setYPosition(yPosition) {
      this.entity.getComponent('PositionComponent').lastYPosition = this.entity.getComponent('PositionComponent').yPosition;
      this.entity.getComponent('PositionComponent').yPosition = yPosition;
    };

    setXPositionProposed(xPosition) {
      this.entity.getComponent('PositionComponent').xPositionProposed = xPosition
    }

    setYPositionProposed(yPosition) {
      this.entity.getComponent('PositionComponent').yPositionProposed = yPosition;
    }

    setAngleDegreesProposed(angleDegreesProposed) {
      this.entity.getComponent('PositionComponent').angleDegreesProposed = angleDegreesProposed;
    }

    getXPositionProposed() {
      return this.entity.getComponent('PositionComponent').xPositionProposed
    }

    getYPositionProposed() {
      return this.entity.getComponent('PositionComponent').yPositionProposed;
    }

    getAngleDegreesProposed() {
      return this.entity.getComponent('PositionComponent').angleDegreesProposed;
    }

    resetProposedPositions() {
      this.setXPositionProposed(null)
      this.setYPositionProposed(null)
      this.setXPositionProposalValid(true)
      this.setYPositionProposalValid(true)
      this.setAngleDegreesProposed(null);
      this.setAngleDegreesProposalValid(true);
    }

    getXPositionProposalValid() {
      return this.entity.getComponent('PositionComponent').xPositionProposedValid
    }

    getYPositionProposalValid() {
      return this.entity.getComponent('PositionComponent').yPositionProposedValid
    }

    getAngleDegreesProposalValid() {
      return this.entity.getComponent('PositionComponent').angleDegreesProposedValid
    }

    setXPositionProposalValid(xValid) {
      this.entity.getComponent('PositionComponent').xPositionProposedValid = xValid
    }

    setYPositionProposalValid(yValid) {
      this.entity.getComponent('PositionComponent').yPositionProposedValid = yValid
    }

    setAngleDegreesProposalValid(angleDegreesValid) {
      this.entity.getComponent('PositionComponent').angleDegreesProposedValid = angleDegreesValid
    }
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    };

    setMaxMagnitude(maxMagnitude) {
      this.entity.getComponent('VectorComponent').maxMagnitude = maxMagnitude;
    }
  
    addVector(magnitude, direction, maxMagnitude) {
        this.entity.getComponent('VectorComponent').addVector(magnitude, direction)
    };

    getVectorTotal() {
      return this.entity.getComponent('VectorComponent').calculateTotalVector();
    }

    getAngleDegrees() {
      return this.entity.getComponent('PositionComponent').angleDegrees;
    }

    setAngleDegrees(angleDegrees) {
      this.entity.getComponent('PositionComponent').angleDegrees = angleDegrees
    }

    getTurnMagnitude() {
      return this.entity.getComponent('VectorComponent').turnMagnitude;
    }

    setTurnMagnitude(turnMagnitude) {
      this.entity.getComponent('VectorComponent').turnMagnitude = turnMagnitude;
    }

    adjustAngleDegrees(angleDegrees, adjustTo) {
      let originalAngleDegrees = this.entity.getComponent('PositionComponent').angleDegrees;
      
      let newAngleDegrees = (originalAngleDegrees + angleDegrees) % 360;
      
      if (adjustTo != null) {
        if (Math.abs(adjustTo - originalAngleDegrees) <= this.getTurnSpeed()) {
          newAngleDegrees = adjustTo
        }
      }
      
      if (newAngleDegrees < 0) {
        newAngleDegrees += 360; // Ensure positive value within the [0, 360) range
      }
      

      this.entity.getComponent('PositionComponent').angleDegrees = newAngleDegrees;
      return newAngleDegrees;
    }

    getAccelerationMagnitude() {
        return this.entity.getComponent('VectorComponent').accelerationMagnitude;
    }

    setAccelerationMagnitude(magnitude, force) {
       if (force) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = magnitude;
       }
       else if (magnitude <= 0) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = 0;
       }
       else if (magnitude > 300) {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = 300;
       }
       else {
        this.entity.getComponent('VectorComponent').accelerationMagnitude = magnitude
       }
    }

    stop() {
      this.entity.getComponent('VectorComponent').removeAllVectors();
    }

    getTurnSpeed() {
      return this.entity.getComponent('VectorComponent').turnSpeed;
    }

    applyBleed() {
      this.entity.getComponent('VectorComponent').bleedVector();
      this.entity.getComponent('VectorComponent').bleedAngle();
    }
  }
  