import { default as Component} from '@core/component'

export default class MaterialComponent extends Component {
    constructor(payload = {}) {
        super();
        this.vectors = []
        this.componentType = "MaterialComponent"
        this.materialType = payload.materialType
    }
}