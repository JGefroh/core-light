import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

import TrailGeneratorComponent from './trail-generator-component';

export default class FootstepTrailFxSystem extends System {
    constructor() {
      super()

      this.trailers = {};

      this.addHandler('REGISTER_FOOTSTEP_TRAIL_FX', (payload) => {
        this.addFootstepTrailFx(payload.entity);
      })
    }
    
    work() {
        this.workForTag('FootstepTrailFxCapable', (trail) => {

          this.workForTag('TrailGenerator', (trailGenerator) => {
            let distance = this._calculateDistanceBetween(trail, trailGenerator)
            if (distance < 40) {
              this._setShouldCreateTrail(trail);
            }
          });
        });
    }

    addFootstepTrailFx(entity) {
        entity.addComponent(new TrailGeneratorComponent());
    }

    _setShouldCreateTrail(trail) {
      let trailer = this.trailers[trail.getId()];
      if (trailer?.interval) {
        clearInterval(trailer.interval);
      }


      let interval = setInterval(() => {
        let trailer = this.trailers[trail.getId()]
        
        if (trail.getXPosition() == trailer.lastXPosition && trail.getYPosition() == trailer.lastYPosition) {
          return; // Entity didn't move.
        }

        this.send('CREATE_PROP', {
          type: trailer.stepsRemaining % 2 == 0 ? 'BLOODY_BOOTPRINT_LEFT' : 'BLOODY_BOOTPRINT_RIGHT', 
          xPosition: trail.getXPosition() + (trailer.stepsRemaining % 2 == 0 ? 2 : -2) , 
          yPosition: trail.getYPosition() + (trailer.stepsRemaining % 2 == 0 ? 2 : -2) , 
          width: 4, 
          height: 16, 
          angleDegrees: trail.getAngleDegrees() + 90
        });

        trailer.stepsRemaining -= 1;
        if (this.trailers[trail.getId()].stepsRemaining <= 0) {
          clearInterval(this.trailers[trail.getId()].interval);
        }
      }, 500)


      this.trailers[trail.getId()] = {
        interval: interval,
        stepsRemaining: 10,
        lastXPosition: trail.getXPosition(),
        lastYPosition: trail.getYPosition()
      }
    }


    _calculateDistanceBetween(trail, trailGenerator) {
      let dx = trail.getXPosition() - trailGenerator.getXPosition();
      let dy = trail.getYPosition() - trailGenerator.getYPosition();

      return Math.sqrt(dx * dx + dy * dy);
    }
  }