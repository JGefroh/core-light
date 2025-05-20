import { default as Component} from '@core/component'

export default class PositionComponent extends Component {
    constructor(payload) {
        super();
        this.componentType = "PositionComponent"
        this.xPosition = payload.xPosition;
        this.yPosition = payload.yPosition;
        this.width = payload.width;
        this.height = payload.height;
        this.angleDegrees = payload.angleDegrees || 0;

        // Proposed variables for collisions
        this.xPositionProposed = null;
        this.yPositionProposed = null;
        this.angleDegreesProposed = null;

        // Default proposals are valid in case there's no collision in the stack
        this.proposedXPositionValid = true;
        this.proposedYPositionValid = true;
        this.proposedAngleDegreesValid = true;

        // Useful trackers for post-movement processing
        this.lastXPosition = payload.xPosition;
        this.lastYPosition = payload.yPosition;
    }
}