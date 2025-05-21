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
        let openedDoor = false;
        this.workForTag('DoorOpener', (doorOpener) => {
            this.workForTag('Door', (door) => {
                let distance = calculateDistanceBetweenTags(door, doorOpener);
                if (distance < 30) {
                    this._openDoor(door);
                    openedDoor = true;
                }
            });
        });
        if (openedDoor) {
            this.send('FORCE_RECALCULATE_LIGHT')
            this.send("PLAY_AUDIO", {
                audioKey: 'metal-door-open.mp3',
                volume: 0.8
            })
        }
    }

    _openDoor(door) {
        this._core.removeEntity(door.getEntity());
    }

    registerDoor(entity) {
        entity.addLabel('Door');
    }
  }