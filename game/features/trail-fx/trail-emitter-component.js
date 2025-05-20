import { default as Component } from '@core/component';

export default class TrailEmitterComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'TrailEmitterComponent';

        this.trailLength = payload.trailLength || 10;
        this.lastTrailTimestamp = Date.now()
        this.trailFrequencyMs = payload.trailFrequencyMs || 500;

        // Properties of current trail
        this.trailRemaining = payload.trailRemaining || 0;
    }
} 