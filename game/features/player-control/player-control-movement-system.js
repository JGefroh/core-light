import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class PlayerControlMovementSystem extends System {
    constructor() {
      super()

      this.wait = 1000/60

      this.accelerationVectorsByDirection = {}
      this.stopsByDirection = {}

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type != 'action' || !payload.action) {
          return;
        }

        if (payload.action.indexOf('stop') !== -1) {
          this.stopsByDirection[payload.action.split('_')[1]] = true
        }
        else if (payload.action.indexOf('move') !== -1) {
          this.accelerationVectorsByDirection[payload.action.split('_')[1]] = true // eg. 'move_up' to 'up'
        }

      });
    }
    
    work() {
      let acceleration = 1;

      var movable = this.getTag('Movable');
      
      this.forTaggedAs('PlayerControllable', (entity) => {
        movable.setEntity(entity);

        if (this.accelerationVectorsByDirection['up']) {
          movable.addVector(acceleration, -90);
        }

        if (this.accelerationVectorsByDirection['down']) {
          movable.addVector(acceleration, 90);
        }

        if (this.accelerationVectorsByDirection['left']) {
          movable.addVector(acceleration, -180);
        }

        if (this.accelerationVectorsByDirection['right']) {
          movable.addVector(acceleration, 0);
        }
      });

      this.accelerationVectorsByDirection = {} // Reset for the next cycle
      this.stopsByDirection = {}
    };

    determineTurnDirection(currentBearing, desiredBearing) {
      // Normalize the angles to ensure they fall within the range of 0 to 360 degrees
      currentBearing = (currentBearing + 360) % 360;
      desiredBearing = (desiredBearing + 360) % 360;
      
      // Calculate the difference between the desired and current bearings
      let angleDifference = desiredBearing - currentBearing;
      
      // Adjust the angle difference to ensure it falls within the range of -180 to 180 degrees
      if (angleDifference <= -180) {
          angleDifference += 360;
      } else if (angleDifference > 180) {
          angleDifference -= 360;
      }
      
      // Determine the turn direction based on the sign of the angle difference
      if (angleDifference < 0) {
          return -1; // Turn left (negative)
      } else if (angleDifference > 0) {
          return 1; // Turn right (positive)
      } else {
          return 0; // No turn needed, already facing the desired direction
      }
    }
  }