import { default as Core}  from '@core/core';
import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import TrailZoneComponent from './trail-zone-component';

export default class TrailSystem extends System {
    constructor() {
      super()

      this.trailers = {};

      this.addHandler('REGISTER_FOOTSTEP_TRAIL_FX', (payload) => {
        this.addFootstepTrailFx(payload.entity);
      })
    }
    
    work() {
      this._activateTrailZones();
      this._createTrails();
    }

    _activateTrailZones() {
      this.workForTag('TrailEmitter', (trailEmitter) => {
        this.workForTag('TrailZone', (trailZone) => {
          let distance = this._calculateDistanceBetween(trailEmitter, trailZone)
          if (distance < 20) {
            this._setShouldCreateTrail(trailEmitter);
          }
        });
      });
    }

    _createTrails() {
      this.workForTag('TrailEmitter', (trailEmitter) => {
        if (trailEmitter.getTrailRemaining() <= 0) {
          return;
        }

        if (!trailEmitter.isTimeToAddTrail()) {
          return;
        }

        if (!trailEmitter.didPositionChange()) {
          return;
        }
        let angleRadians = (trailEmitter.getAngleDegrees() * Math.PI) / 180;
        let xPositionLocal = (0);
        let yPositionLocal = (trailEmitter.getTrailRemaining() % 2 == 0 ? -8 : 8);
        let xPositionOffset = xPositionLocal * Math.cos(angleRadians) - yPositionLocal * Math.sin(angleRadians);
        let yPositionOffset = xPositionLocal * Math.sin(angleRadians) + yPositionLocal * Math.cos(angleRadians);

        this.send('CREATE_PROP', {
          type: trailEmitter.getTrailRemaining() % 2 == 0 ? 'BLOODY_BOOTPRINT_LEFT' : 'BLOODY_BOOTPRINT_RIGHT', 
          xPosition: trailEmitter.getXPosition() + xPositionOffset, 
          yPosition: trailEmitter.getYPosition() + yPositionOffset, 
          width: 4, 
          height: 16, 
          angleDegrees: trailEmitter.getAngleDegrees() + 90
        });

        trailEmitter.updateTrailStats();
      });
    }

    addFootstepTrailFx(entity) {
        entity.addComponent(new TrailZoneComponent());
    }

    _setShouldCreateTrail(trailEmitter) {
      trailEmitter.setTrailRemaining(10)
    }


    _calculateDistanceBetween(trailEmitter, trailZone) {
      let dx = trailEmitter.getXPosition() - trailZone.getXPosition();
      let dy = trailEmitter.getYPosition() - trailZone.getYPosition();

      return Math.sqrt(dx * dx + dy * dy);
    }
  }