import { default as System } from '@core/system';

export default class AnimationSystem extends System {
    constructor(config = {}) {
      super()

      this.addHandler('SET_ANIMATION', (payload) => {
        this.setAnimation(payload.entityId, payload.animation, payload.type)
      });

      this.addHandler('STOP_ANIMATION', (payload) => {
        this.stopAnimation(payload.entityId);
      })

      this.addHandler('LOAD_ANIMATION', (payload) => {
        this.loadAnimationSequence(payload.entityId, payload.spritesheetName);
      })
    }
  
    work() {
        this.workForTag('Animatable', (tag, entity) => {
            this.advanceFrame(tag)
        });
    };

    advanceFrame(animatable) {
        animatable.advanceFrame();
    }

    setAnimation(entityId, animation, type = 'loop') {
        let entity = this._core.getEntityWithId(entityId);
        if (!entity || !entity.hasComponent('AnimationComponent')) {
            return;
        }

        let tag = this._core.getTag('Animatable');
        tag.setEntity(entity);

        tag.setAnimation(animation)
        tag.setAnimationState(type)
        if (type == 'once') {
            tag.restartAnimation()
        }
    }

    loadAnimationSequence(entityId, spritesheetName) {
        let spritesheet = new Image();
        spritesheet.src = `assets/images/${spritesheetName}.png`

        fetch(`assets/images/${spritesheetName}.json`).then((data) => {
            return data.json();
        }).then((json) => {
            json.rows.forEach((row) => {
                this.loadSequence(entityId, spritesheet, row.animation, row.frameWidth || json.frameWidth, row.frameHeight || json.frameHeight, json.frameMarginX, json.frameMarginY, row.row, row.length, row.msBetweenFrames, json)
            });
        })
    }

    loadSequence(entityId, sheetData, animationName, frameWidth, frameHeight, frameMarginX, frameMarginY, startRow, length, msBetweenFrames, details) {
        let entity = this._core.getEntityWithId(entityId);
        if (!entity) {
            return;
        }

        let animationComponent = entity.getComponent('AnimationComponent')
        animationComponent.animations[animationName] = {
            frames: [],
            msBetweenFrames: msBetweenFrames || details.msBetweenFrames
        }
        let offscreenCanvas = new OffscreenCanvas(frameWidth, frameHeight);
        let canvasCtx = offscreenCanvas.getContext('webgl');
        offscreenCanvas.width = frameWidth;
        offscreenCanvas.height = frameHeight;

        for (let frameIndex = 0; frameIndex < length; frameIndex++) {
            let startX = (frameIndex * frameWidth) + (frameIndex * frameMarginX * 2) + frameMarginX
            let startY = ((frameMarginY * 2) + frameHeight) * startRow + frameMarginY;
            
            canvasCtx.drawImage(sheetData, startX, startY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight)

            offscreenCanvas.convertToBlob().then((blob) => {
                let blobUrl = URL.createObjectURL(blob);
                let image = new Image();
                image.src = blobUrl
    
                animationComponent.pushFrameTo(animationName, image, frameIndex, frameWidth, frameHeight)
            })

            // Clear for next frame
            canvasCtx.clearRect(0, 0, frameWidth, frameHeight)
        }
    }

    stopAnimation(entityId) {
        let entity = this._core.getEntityWithId(entityId);
        if (!entity || !entity.hasComponent('AnimationComponent')) {
            return;
        }

        let tag = this._core.getTag('Animatable');
        tag.setEntity(entity);

        tag.setAnimationState('stopped')
    }
}