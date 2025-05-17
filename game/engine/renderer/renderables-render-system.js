import { default as System } from '@core/system';

// Handles rendering of Renderable entities. Look at render-system for render layer and canvas management
export default class RenderablesRenderSystem extends System {
    constructor(config = {}) {
      super()

      // Rules around render stack fo Renderables
      this.renderMode = 'shape'
      this.renderablesLayerOrder = ['TERRAIN', 'LOWER_DECOR', 'WALL', 'PROP', 'CHARACTER_DECOR_LOWER', 'CHARACTER', 'UPPER_DECOR', 'TOP']
    }

    initialize() {
      this.send("REGISTER_RENDER_LAYER", {
        layer: 'RENDERABLES',
        layerRenderLibrary: 'webgl2', //webgl2 or 2d (canvas)
        render: this._render.bind(this)
      })
    }

    _render(renderOptions) {
      this._renderRenderables(renderOptions.layerCanvasCtx, renderOptions.viewport, renderOptions.renderer);
    }

    _renderRenderables(canvasCtx, viewport, renderer, options = {}) {
      this._sortRenderablesIntoRenderLayers()
      renderer.preFrame(canvasCtx, viewport);

      for (let renderLayer of this.renderablesLayerOrder) {
        let renderableEntities = this.sortedRenderableEntitiesByRenderLayer[renderLayer] || [];

        let renderable = this.getTag('Renderable');
        for (let entity of renderableEntities) {
          renderable.setEntity(entity);
          this._renderRenderable(canvasCtx, viewport, renderer, renderable)
        };
        renderer.forceDraw(canvasCtx, viewport);
      }
      
      renderer.postFrame(canvasCtx, viewport);
    }

    _prepareRendererForIteration(canvasCtx, viewport, renderer) {
      renderer.prepareFrame(canvasCtx, viewport);
    }

    _renderRenderable(canvasCtx, viewport, renderer, renderable) {
      renderer.saveContext(canvasCtx);

      if (renderable.getShape() == 'path') {
        this._renderAsPath(canvasCtx, viewport, renderer, renderable)
      }
      else if (this.renderMode == 'shape') {
        this._renderAsShape(canvasCtx, viewport, renderer, renderable)
      }
      else if (renderable.getImagePath()) {
        this._renderAsImage(canvasCtx, viewport, renderer, renderable)
      }

      renderer.restoreContext(canvasCtx);
    }

    _sortRenderablesIntoRenderLayers() {
      this.sortedRenderableEntitiesByRenderLayer = {}
      this.workForTag('Renderable', (renderable, entity) => {
        if (!this.sortedRenderableEntitiesByRenderLayer[renderable.getRenderLayer()]) {
          this.sortedRenderableEntitiesByRenderLayer[renderable.getRenderLayer()] = []
        }
        this.sortedRenderableEntitiesByRenderLayer[renderable.getRenderLayer()].push(entity)
      });
    }

    _renderAsShape(canvasCtx, viewport, renderer, renderable) {
      let shape = renderable.getShape()
      let shapeWidth = renderable.getWidth();
      let shapeHeight = renderable.getHeight();
      let xPosition = renderable.getXPosition();
      let yPosition = renderable.getYPosition();
      if (renderable.getEntity().key == 'laser') {
        shape = 'laser'
      }

      renderer.drawShape(canvasCtx, viewport, shape, shapeWidth, shapeHeight, xPosition, yPosition,
         renderable.getAngleDegrees(), 
         renderable.getShapeColor(),
         renderable.getOptions())
    }

    _renderAsImage(canvasCtx, viewport, renderer, renderable) {
      let img = this._getCachedImage(renderable)
      let imageWidth = renderable.getWidth();
      let imageHeight = renderable.getHeight();
      let xPosition = renderable.getXPosition()
      let yPosition = renderable.getYPosition()

      renderer.drawImage(canvasCtx, viewport, img, imageWidth, imageHeight, xPosition, yPosition)
    }

    _renderAsPath(renderCtx, viewport, renderer, renderable) {
      renderer.drawPath(renderCtx, viewport, 
        renderable.getXPosition(), 
        renderable.getYPosition(), 
        renderable.getPathPoints(), 
        renderable.getShapeColor(),
        {
            returnToOrigin: false,
            arcSize: 0,
            fill: [
                [0.0, 'rgba(255, 250, 230, 1.0)'],
                [1.0, 'rgba(255, 250, 230, 1.0)'],
            ]
        }
    );
    }

    _getCachedImage(renderable) {
      let img = renderable.getImageObject()
      
      if (!img) {
        img = new Image()
        img.src = renderable.getImagePath();
        renderable.setImageObject(img)
      }

      return img
    }
}