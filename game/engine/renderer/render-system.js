import { default as System } from '@core/system';
import CanvasRenderer from '@game/engine/renderer/canvas-renderer'
import WebGL2Renderer from '@game/engine/renderer/webgl2-renderer'

// Handles canvas mangement, renderer setup, and provides hooks for component rendering systems 
// If you want to see object / Renderable rendering, go to the renderables-render-system.js
export default class RenderSystem extends System {
    constructor(config = {}) {
      super()

      this.clearScreenColor = 'rgba(0,0,0,1)';
      this.viewportScale = 1;

      this.renderMethod = '2d'

      // Initialization of the primary canvas and primary renderer
      this.primaryRenderer = new CanvasRenderer();
      this.primaryCanvas = document.getElementById('canvas');

      // Rules around the canvas stack
      this.canvasLayerOrder = ['RENDERABLES', 'PARTICLES_BEFORE_LIGHTING', 'LIGHTING', 'PARTICLES_AFTER_LIGHTING']
      this.canvasesByLayer = {}
      this.canvasesByKey = {}
      this.lastCanvasLayerId = 0;

      this.renderers = {
        '2d': CanvasRenderer,
        'webgl2': WebGL2Renderer
      }


      this.addHandler('REGISTER_RENDER_LAYER', (payload) => {
        this._addToCanvasesByLayer(payload);
      })
    }

    _addToCanvasesByLayer(payload) {
      if (!this.canvasesByLayer[payload.layer]) {
        this.canvasesByLayer[payload.layer] = []
      }
      if (this.canvasLayerOrder.indexOf(payload.layer) == -1) {
        this.canvasLayerOrder.push(payload.layer)
      }
      let layerKey = `${this.lastCanvasLayerId++}-${payload.layer}`;
      let layerRenderLibrary = payload.layerRenderLibrary || '2d'
      let layerCanvas = this._ensureLayerCanvasAvailable(layerKey, layerRenderLibrary);
      let layerCanvasCtx = layerCanvas.getContext(layerRenderLibrary, {antialias: false})
      let renderer = new this.renderers[layerRenderLibrary](layerCanvasCtx)
      

      this.canvasesByLayer[payload.layer].push({
        layer: payload.layer,
        layerKey: layerKey,
        canvas: layerCanvas,
        render: payload.render,
        layerRenderLibrary: layerRenderLibrary,
        renderer: renderer,
        applyOptions: payload.applyOptions || {}
      })

      if (payload.onInitialize) {
        payload.onInitialize(renderer, layerCanvasCtx); // Callback hook so other systems can perform renderer initialization
      }
    }

    _ensureLayerCanvasAvailable(layerKey, layerRenderLibrary) {
      if (this.canvasesByKey[layerKey]) {
          return true;
      }

      let layerCanvas = document.createElement('canvas');
      layerCanvas.width = this.primaryCanvas.width;
      layerCanvas.height = this.primaryCanvas.height;

      this.canvasesByKey[layerKey] = layerCanvas

      return this.canvasesByKey[layerKey]
    }
  
    work() {
      if (!this.primaryCanvas) {
        return;
      }

      let primaryCanvasCtx = this.primaryCanvas.getContext(this.renderMethod);
      let viewport = this._core.getData('VIEWPORT') || {xPosition: 0, yPosition: 0, width: primaryCanvasCtx.canvas.width, height: primaryCanvasCtx.canvas.height, scale: this.viewportScale};

      this.canvasLayerOrder.forEach((key) => {
        (this.canvasesByLayer[key] || []).forEach((layer) => {
          let layerRenderOptions = {
            layerCanvas: layer.canvas,
            layerCanvasCtx: layer.canvas.getContext(layer.layerRenderLibrary),
            viewport: viewport,
            renderer: layer.renderer
          }

          layerRenderOptions.renderer.clearScreen(layerRenderOptions.layerCanvasCtx, this.clearScreenColor)

          layer.render(layerRenderOptions);

          this.primaryRenderer.drawCanvasLayer(primaryCanvasCtx, layer)
        });
      });
    };
}