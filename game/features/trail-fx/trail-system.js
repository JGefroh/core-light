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

        this.send('CREATE_PROP', {
          type: trailEmitter.getTrailRemaining() % 2 == 0 ? 'BLOODY_BOOTPRINT_LEFT' : 'BLOODY_BOOTPRINT_RIGHT', 
          xPosition: trailEmitter.getXPosition() + (trailEmitter.trailRemaining % 2 == 0 ? 2 : -2) , 
          yPosition: trailEmitter.getYPosition() + (trailEmitter.trailRemaining % 2 == 0 ? 2 : -2) , 
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