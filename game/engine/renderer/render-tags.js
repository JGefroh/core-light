import { default as Tag } from '@core/tag'

export default class Renderable extends Tag {
    static tagType = 'Renderable'

    constructor() {
      super();
      this.tagType = 'Renderable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('RenderComponent') && entity.hasComponent('PositionComponent');
    };

    getRenderLayer() {
      return this.entity.getComponent('RenderComponent').renderLayer.toUpperCase();
    }

    getRenderFromCorner() {
      return this.entity.getComponent('RenderComponent').renderFromCorner;
    }

    getXPosition() {
      return this.entity.getComponent('PositionComponent').xPosition;
    };
  
    getYPosition() {
      return this.entity.getComponent('PositionComponent').yPosition;
    };
  
    getWidth() {
      let width = null;
      if (this.entity.getComponent('AnimationComponent')) {
        let dimensions = this.entity.getComponent('AnimationComponent').getCurrentFrameDimensions();
        if (dimensions) {
          width = dimensions.width;
        }
      }

      if (!width) {
        return this.entity.getComponent('RenderComponent').width || this.entity.getComponent('PositionComponent').width;
      }
      else {
        return width;
      }
    };

    getHeight() {
      let height = null;
      if (this.entity.getComponent('AnimationComponent')) {
        let dimensions = this.entity.getComponent('AnimationComponent').getCurrentFrameDimensions();
        if (dimensions) {
          height = dimensions.height;
        }
      }

      if (!height) {
        return this.entity.getComponent('RenderComponent').height || this.entity.getComponent('PositionComponent').height;
      }
      else {
        return height;
      }
    }

    getImagePath() {
      return this.entity.getComponent('RenderComponent').imagePath;
    }

    setImageObject(imageObject) {
      return this.entity.getComponent('RenderComponent').setImageObject(imageObject);
    }

    getImageObject() {
      let imageObject = null;
      if (this.entity.getComponent('AnimationComponent')) {
        imageObject = this.entity.getComponent('AnimationComponent').getCurrentFrameImageObject();
      }
      if (!imageObject) {
        imageObject = this.entity.getComponent('RenderComponent').imageObject;
      }
      return imageObject;
    }

    getAngleDegrees() {
      if (this.entity.getComponent('RenderComponent').angleDegrees != null) {
        return this.entity.getComponent('RenderComponent').angleDegrees
      }
      else {
        return this.entity.getComponent('PositionComponent').angleDegrees
      }
    }
    
    getAngleRadians() {
      return (this.getAngleDegrees() * Math.PI) / 180
    }

    getShape() {
      return this.entity.getComponent('RenderComponent').shape;
    }

    getShapeColor() {
      return this.entity.getComponent('RenderComponent').shapeColor;
    }

    getOptions() {
      let renderComponent = this.entity.getComponent('RenderComponent');
      return {
        borderColor: renderComponent.borderColor,
        borderSize: renderComponent.borderSize
      }
    }
    getPathPoints() {
      return this.entity.getComponent('RenderComponent').pathPoints;
    }
}
  