import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'

import { angleTo, toFriendlyMeters, distanceFromTo, toMetersFromCoordinateUnits, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';


export default class WeaponFiringSystem extends System {
    constructor() {
      super()

      this.timesPerSecond = 60;
      

      this.addHandler('REQUEST_FIRE_WEAPON', (payload) => {
        this._requestFireWeapon(payload.entityId, payload.weaponKey, payload.fireRequested, payload.xPosition, payload.yPosition);
      });
    }

    _requestFireWeapon(entityId, weaponKey, fireRequested, xPosition, yPosition) {
      this.workForTag('Weapon', (tag, entity) => {
        if (!tag.belongsToEntity(entityId)) {
          return;
        }

        if (tag.getWeaponKey() == weaponKey) {
          tag.setFireRequest(fireRequested ? {xPosition: xPosition, yPosition: yPosition} : null);
        }
      });
    }
  
    work() {
      if (this.notYetTime(this.timesPerSecond, this.lastRanTimestamp)) {
        return true;
      }

      this._fireRequestedWeapons();
  };

    _fireRequestedWeapons() {
      this.workForTag('Weapon', (tag, entity) => {

        if (!tag.getFireRequest()) {
          return false;
        }

        tag.setFireRequest(null)

        this.send("REQUEST_FIRE_RIFLE", {
          tag: tag
        })
      });
    }
  }
  