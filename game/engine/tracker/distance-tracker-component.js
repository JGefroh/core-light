import { default as Component} from '@core/component'

export default class DistanceTrackerComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = "DistanceTrackerComponent"
        this.totalDistance = 0;
        this.totalDistanceMax = payload.totalDistanceMax || Infinity
        this.onMaxExceeded = payload.onMaxExceeded || (() => {})
    }
}