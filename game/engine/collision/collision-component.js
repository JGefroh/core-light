import { default as Component} from '@core/component'

export default class CollisionComponent extends Component {
    constructor(payload = {}) {
        super();
        this.collisionGroup = payload.collisionGroup || 'default';
        this.componentType = "CollisionComponent"

        this.collisionShape = payload.collisionShape || 'rectangle' // circle, rectangle

        this.onCollision = payload.onCollision || ((collidable) => {});
    }
}