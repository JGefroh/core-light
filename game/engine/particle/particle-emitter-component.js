import { default as Component } from '@core/component';

export default class ParticleEmitterComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'ParticleEmitterComponent';

        this.particleEmissionCyclesCurrent = 0;

        Object.assign(this, payload)
    }
} 