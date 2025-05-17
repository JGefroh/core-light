import { default as System } from '@core/system';
import { default as Entity } from '@core/entity.js'


export default class WeaponRecoilSystem extends System {
  constructor() {
    super()
    this.timesPerSecond = 1000;
    this.addHandler('RECOIL_REQUESTED', (payload) => {
      this.workForEntityWithTag(payload.entityId, 'Movable', (entity, tag) => {
        let recoilAmount = (Math.random() * 3 - 1) * payload.amount;
        tag.setAngleDegrees(tag.getAngleDegrees() + recoilAmount);
      })
    });
  }
}
  