import { default as System } from '@core/system';

export default class TextureSystem extends System {
    constructor(config = {}) {
      super()

      this.maxAtlasWidth = 8192;
      this.maxAtlasHeight = 8192;

      this.atlasCanvas = null;
      this.atlasWidth = 1;
      this.atlasHeight = 1;


      this.addHandler('LOAD_TEXTURES_FROM_MANIFEST', (payload) => {
        this._loadManifest(payload.manifest, payload.onLoad)
      })
    }
  
    work() {
    };

    async _loadManifest(manifest, onLoad) {
        let images = {}
        for (const key of Object.keys(manifest)) {
            let image = await this._loadImage(key, manifest[key].path);
            images[key] = image;
        }

        let atlasCanvas = this._generateAtlas(images);
        let atlasImage = await createImageBitmap(atlasCanvas)
        
        let atlas = {
            atlasImage: atlasImage,
            width: atlasCanvas.width,
            height: atlasCanvas.height,
            images: images
        }

        onLoad(atlas);
    }

    _loadImage(key, path) {
        return fetch(`/assets/images/${path}`)
        .then((response) => {
            return response.blob()
        })
        .then((blob) => {
            return createImageBitmap(blob);
        })
        .then((imageBitmap) => {
            return {
                key: key,
                path: path,
                imageBitmap: imageBitmap,
                width: imageBitmap.width,
                height:imageBitmap.height,
            }
        })
    }
    _generateAtlas(images) {
        let lastUsedX = 0;
        let lastUsedY = 0;
        let maxHeightOfRow = 0;
        let atlasWidth = 0;
        let atlasHeight = 0;
        const entries = Object.values(images);
        for (const image of entries) {
            if (lastUsedX + image.width > this.maxAtlasWidth) {
                atlasWidth = Math.max(atlasWidth, lastUsedX);
                lastUsedX = 0;
                lastUsedY += maxHeightOfRow;
                maxHeightOfRow = 0;
                
            }
            image.atlasXPosition = lastUsedX;
            image.atlasYPosition = lastUsedY;

            lastUsedX += image.width;
            maxHeightOfRow = Math.max(image.height, maxHeightOfRow)
        }
        atlasHeight = lastUsedY + maxHeightOfRow;
        atlasWidth = Math.max(lastUsedX, atlasWidth)

        return this._generateAtlasCanvas(entries, atlasWidth, atlasHeight);
    }

    _generateAtlasCanvas(images, atlasWidth, atlasHeight) {
        const canvas = document.createElement('canvas');
        canvas.width = atlasWidth;
        canvas.height = atlasHeight;
    
        const ctx = canvas.getContext('2d');

        const entries = Object.values(images);
        for (const image of entries) {
            ctx.drawImage(
                image.imageBitmap,
                image.atlasXPosition,
                image.atlasYPosition
            );
        }
    
        return canvas;
    }
}