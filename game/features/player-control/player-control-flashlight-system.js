import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class PlayerControlFlashlightSystem extends System {
    constructor() {
      super()

      this.wait = 1000/60

      this.flashlightRequestedOff = false;
      this.flashlightMode = 'cone'

      this.addHandler('INPUT_RECEIVED', (payload) => {
        if (payload.type != 'action' || !payload.action) {
          return;
        }
 
        if (payload.action == 'flashlight_off') {
          (this.flashlightRequestedOff === null || false) ? false : true;
        }
 
        if (payload.action == 'flashlight_mode_toggle') {
          this.flashlightMode = this.flashlightMode == 'cone' ? 'point' : 'cone'
        }
      });
    }

    work() {
      let lightable = this.getTag('Lightable');
      let playerControllable = this.getTag('PlayerControllable');

      this.workForTag('Attached', (tag, entity) => {
        let parentEntity = tag.getAttachedToEntity();
        if (!parentEntity || !playerControllable.constructor.isAssignableTo(parentEntity) || !lightable.constructor.isAssignableTo(entity)) {
          // Right now, assumed that the flashlighted is attached to the entity that is the player controlled character.
          return;
        }

        lightable.setEntity(entity);

        if (lightable.isDisableOverride()) {
          return;
        }

        if (this.flashlightRequestedOff === true) {
          lightable.setOn(false)
        }
        else if (this.flashlightRequestedOff === false) {
          lightable.setOn(true)
        }

        lightable.setLightType(this.flashlightMode)
      });
      this.flashlightRequestedOff = null;
    };
}