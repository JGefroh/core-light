import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';

// Used to render the bullet
import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import TimerComponent from '@game/engine/timer/timer-component';
import LightSourceComponent from '../../engine/lighting/light-source-component';
export default class RifleFiringSystem extends System {
    constructor() {
      super()

        this.weapon = {
            key: 'rifle',
            type: 'rifle',
            shotsPerMinute: 800,
            ammunitionType: 'continuous',
            maxAmmunition: 30,
            shotSpeedMetersPerSecond: 10,
            bulletWidth: 16,
            bulletHeight: 1,
            width: 8,
            height: 8,
            range: 800,
            damage: 50
        }

      this.addHandler('REQUEST_FIRE_RIFLE', (payload) => {
        this.fireWeapon(payload)
      });
    }

    _calculateBulletMath(weapon) {
      return {
        magnitude: toCoordinateUnitsFromMeters(weapon.shotSpeedMetersPerSecond),
        timesPerSecond: (weapon.shotsPerMinute / 60),
      }
    }

    fireWeapon(payload) {
        let weapon = this.weapon;
        let weaponTag = payload.tag;
        let bulletMath = this._calculateBulletMath(weapon);
        if (this.notYetTime(bulletMath.timesPerSecond, weaponTag.getLastFired())) {
          return;
        }
        if (weaponTag.getCurrentAmmunition() <= 0) {
          return;
        }
        const angleDegrees = weaponTag.getAngleDegrees();
        const angleRadians = angleDegrees * (Math.PI / 180);

        const offsetRight = 15;
        const offsetUp = 0;

        const offsetX = offsetRight * Math.cos(angleRadians) - offsetUp * Math.sin(angleRadians);
        const offsetY = offsetRight * Math.sin(angleRadians) + offsetUp * Math.cos(angleRadians);

        const xPosition = weaponTag.getXPosition() + offsetX;
        const yPosition = weaponTag.getYPosition() + offsetY;

        let firingEntity = weaponTag.getOwningEntity();
        if (!firingEntity) {
          return;
        }

        weaponTag.setLastFired(Date.now());
        weaponTag.decrementCurrentAmmunition();
        weaponTag.setFireRequest(null)

        this.send('HITSCAN_REQUESTED', {
          originX: xPosition,
          originY: yPosition,
          range: this.weapon.range,
          angleDegrees: weaponTag.getAngleDegrees(),
          callback: (result) => {
            this.send('IMPACT_FX_REQUESTED', {
              entity: result.entity, xPosition: result.xPosition, yPosition: result.yPosition, angleDegrees: weaponTag.getAngleDegrees(), 
            })
            this.send('REQUEST_DAMAGE', {
              entity: result.entity,
              amount: weapon.damage
            })
          }
        });

        this.send("RECOIL_REQUESTED", {
          entityId: firingEntity.id,
          amount: 2
        });
        this.send("WEAPON_EFFECT_REQUESTED", {
          entityId: firingEntity.id,
          weaponXPosition: weaponTag.getXPosition(),
          weaponYPosition: weaponTag.getYPosition(),
          weaponOffsetX: offsetX,
          weaponOffsetY: offsetY,
          effects: [{type: 'flash'}],
          range: this.weapon.range,
          angleDegrees: weaponTag.getAngleDegrees(),
          bulletMath: bulletMath,
          weapon: weapon
        });
        this.send("PLAY_AUDIO", {
          audioKey: 'gunshot.mp3',
          sourceXPosition: xPosition, 
          sourceYPosition: yPosition, 
          decibels: 157
        })

        this.forKeyedAs('ui-pc-highlight', (light) => {
          const ammo = Math.min(30, weaponTag.getCurrentAmmunition());

          const minLight = 8;
          const maxLight = Math.min(30, this.weapon.maxAmmunition)

          const ammoRatio = ammo / maxLight
          const lightRadius = minLight + (maxLight - minLight) * ammoRatio;

          light.getComponent('LightSourceComponent').maxDistance = lightRadius;
        });
    }

    work() {
    };
  }
  