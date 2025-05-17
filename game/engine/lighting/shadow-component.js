import { default as Component } from '@core/component';

export default class ShadowComponent extends Component {
    constructor(payload = {}) {
        super();
        this.componentType = 'ShadowComponent';

        this.rectangleEdgesCache = null;
    }
} 