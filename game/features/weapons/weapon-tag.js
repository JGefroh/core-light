import { default as Tag } from '@core/tag'

export default class Weapon extends Tag{
  static tagType = 'Weapon'

    constructor() {
        super()
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('PositionComponent') && entity.hasComponent('WeaponComponent');
    };

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    }

    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    }

    getOwningEntity() {
      return this.entity.getComponent('AttachedComponent')?.attachedToEntity || this.entity;
    }

    belongsToEntity(entityId) {
      return this.entity.getComponent('AttachedComponent')?.attachedToEntity?.id == entityId || this.entity.id == entityId;
    }

    setFireRequest(fireRequestPayload) {
      this.entity.getComponent('WeaponComponent').fireRequest = fireRequestPayload;
    }

    getFireRequest() {
      return this.entity.getComponent('WeaponComponent').fireRequest;
    }

    getWeaponKey() {
      return this.entity.getComponent('WeaponComponent').weaponKey;
    }

    getCurrentAmmunition() {
      return this.entity.getComponent('WeaponComponent').currentAmmunition;
    }

    setCurrentAmmunition(currentAmmunition) {
      this.entity.getComponent('WeaponComponent').currentAmmunition = currentAmmunition;
    }

    getLastFired() {
      return this.entity.getComponent('WeaponComponent').lastFired;
    }

    setLastFired(time) {
      this.entity.getComponent('WeaponComponent').lastFired = time
    }

    decrementCurrentAmmunition() {
      this.entity.getComponent('WeaponComponent').currentAmmunition--;
    }

    getAngleDegrees() {
      return this.entity.getComponent('PositionComponent').angleDegrees;
    }
  }