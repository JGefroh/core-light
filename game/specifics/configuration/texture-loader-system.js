import { default as System } from '@core/system';
import { default as manifest} from './manifest.js'

export default class TextureLoaderSystem extends System {
    constructor(config = {}) {
      super()
      
      this.send('LOAD_TEXTURES_FROM_MANIFEST', {
        manifest: manifest,
        onLoad: (texture) => {
          this.send('LOAD_TEXTURE_TO_RENDERER', texture)
        }
      })
    }
  
    work() {
    };
}