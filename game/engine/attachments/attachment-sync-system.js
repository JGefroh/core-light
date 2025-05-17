import { default as System } from '@core/system';

// Purpose: If an entity has an attached entity, it will get its position and angle from its parent entity. This is useful
// for things that visually and positionally need to be aligned (eg. turrets on a ship, wheels on a car).
export default class AttachmentSyncSystem extends System {
  constructor() {
    super();
  }
  
  work() {
    this.workForTag('Attached', (tag, entity) => {
      if (tag.isStillAttached()) {
        if (tag.shouldSync('xPosition') || tag.shouldSync('yPosition')) {
          tag.syncPosition();
        }
        if (tag.shouldSync('angleDegrees')) {
          tag.syncAngleDegrees();
        }
      }
      else {
        this._core.removeEntity(entity.id)
      }
    });
  };
}
  