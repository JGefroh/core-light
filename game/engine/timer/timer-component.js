import { default as Component } from '@core/component';

export default class TimerComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'TimerComponent'
        this.onEndEffect = payload.onEndEffect || 'destroy_entity'
        this.startedAt = Date.now();
        this.time = payload.time;
        this.endedAt = null;
    }
}