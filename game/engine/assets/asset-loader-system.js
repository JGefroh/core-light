import { default as System } from '@core/system';

export default class AssetLoaderSystem extends System {
    constructor(config = {}) {
      super()

      this.addHandler('LOAD_ASSETS', (payload) => {
        this._loadAssets(payload.assetManifest);
      });
    }
  
    work() {
    };

    _loadAssets(assetManifest) {
      // Textures are flat images, but also have images.
      const combinedTextures = {
        ...assetManifest.textures,
        ...this._removeJsonDefinitions(assetManifest.props)
      };
      
      this.loadTextures(combinedTextures);
      this.loadProps(assetManifest.props);
    }

    _removeJsonDefinitions(props) {
      return Object.fromEntries(
        Object.entries(props)
          .filter(([key, value]) => !value.path.endsWith('.json'))
      )
    }

    loadTextures(textures) {
      this.send('LOAD_TEXTURES_FROM_MANIFEST', {
        manifest: textures,
        onLoad: (texture) => {
          this.send('LOAD_TEXTURE_TO_RENDERER', texture)
        }
      })
    }

    async loadProps(props) {
      for (const [key, value] of Object.entries(props)) {
        if (value.path.endsWith('.json')) {
          let propDefinition = await fetch(`/assets/images/${value.path}`).then((response) => {
            return response.json();
          });
          this.send('DEFINE_PROP', propDefinition)
        }
        else {
          let propDefinition = {type: key, imageKey: key}
          this.send('DEFINE_PROP', propDefinition)
        }
      }
    }
}