import { default as Component } from '@core/component';

export default class LogicComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'LogicComponent';
        this.rules = payload.rules || [];
    }
} 