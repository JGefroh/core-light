import { default as System } from '@core/system';

export default class MovementFinalizationSystem extends System {
    constructor() {
      super();
    }
    
    work() {
      this.workForTag('Movable', (movable, entity) => {
        if (movable.getXPositionProposalValid()) {
          movable.setXPosition(movable.getXPositionProposed());
        }
        if (movable.getYPositionProposalValid()) {
          movable.setYPosition(movable.getYPositionProposed());
        }

        if (movable.getAngleDegreesProposalValid() && movable.getAngleDegreesProposed() != null) {
          movable.setAngleDegrees(movable.getAngleDegreesProposed());
        }

        movable.applyBleed();
        movable.resetProposedPositions();
      });
    };
  }