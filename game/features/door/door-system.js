import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

import { calculateDistanceBetweenTags } from '@game/engine/position/distance';


export default class DoorSystem extends System {
    constructor() {
      super()

      this.addHandler('REGISTER_DOOR', (payload) => {
        this.registerDoor(payload.entity);
      })
    }
    
    work() {
        this.workForTag('DoorOpener', (doorOpener) => {
            this.workForTag('Door', (door) => {
                let distance = calculateDistanceBetweenTags(door, doorOpener);
                if (distance < 30) {
                    this._openDoor(door);
                }
            });
        });
    }

    _openDoor(door) {
        this._core.removeEntity(door.getEntity());
    }

    registerDoor(entity) {
        entity.addLabel('Door');
    }
  }