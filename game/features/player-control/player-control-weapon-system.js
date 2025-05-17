import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class PlayerControlWeaponSystem extends System {
    constructor() {
      super()

      this.wait = 1000/60

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type != 'action' || !payload.action) {
          return;
        }
 
        if (payload.action == 'attack_1') {
          this._requestFireWeapon();
        }
      });
    }

    _requestFireWeapon() {
      let cursorCoordinates = this._core.getData('CURSOR_COORDINATES');

      this.workForTag('PlayerControllable', (tag, entity) => {
          this.send(
            'REQUEST_FIRE_WEAPON',
            {
              entityId: entity.id,
              weaponKey: 'rifle',
              fireRequested: true,
              xPosition: cursorCoordinates?.world?.xPosition || 0,
              yPosition: cursorCoordinates?.world?.yPosition || 0, 
            }
          );
      });
    }
    
    work() {
    };
}