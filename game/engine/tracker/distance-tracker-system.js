import { default as System } from '@core/system';

export default class DistanceTrackerSystem extends System {
    constructor() {
      super();
    }
    
    work() {
      this.workForTag('DistanceTrack', (tag, entity) => {
        this.workForEntityWithTag(entity.id, 'Movable', (mEntity, mTag) => {
            let prevX = mTag.getXPosition();
            let newX = mTag.getXPositionProposed();
            let prevY = mTag.getYPosition();
            let newY = mTag.getYPositionProposed();
            
            let dx = newX - prevX;
            let dy = newY - prevY;
            
            let distance = Math.sqrt(dx * dx + dy * dy);
            let result = tag.incrementTotalDistance(distance);

            if (result > tag.getTotalDistanceMax()) {
                tag.onMaxExceeded();
            }
        });
      });
    };
  }