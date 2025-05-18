import { default as Component } from '@core/component';

export default class RenderComponent extends Component {
    constructor(payload) {
        super()
        this.componentType = 'RenderComponent'
        this.width = payload.width;
        this.height = payload.height;
        this.imagePath = payload.imagePath;
        this.angleDegrees = payload.angleDegrees; // This is used for visual angles, and not position-based logic.

        this.renderLayer = payload.renderLayer || 'TOP'
        this.renderFromCorner = payload.renderFromCorner || false;

        // Shape primitivis
        this.shape = payload.shape ||'rectangle' // rectangle, circle, path
        this.shapeColor = payload.shapeColor || 'orange'
        this.pathPoints = payload.pathPoints || null; // If oyu want path rendering.

        this.borderColor = payload.borderColor;
        this.borderSize = payload.borderSize;
    }
    

    setImageObject(imageObject) {
        this.imageObject = imageObject;
    }
}