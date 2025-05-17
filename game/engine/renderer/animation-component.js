import { default as Component } from '@core/component';

export default class AnimationComponent extends Component {
    constructor(payload = {}) {
        super()
        this.componentType = 'AnimationComponent'

        // Basics - track and advance to the next frame
        this.animations = payload.animations || {}
        this.currentFrameIndex = 0;
        this.currentAnimation = payload.currentAnimation || null;
        this.animationState = 'loop'

        // Timing of frames
        this.lastFrameTime = Date.now();
    }

    getCurrentFrameImageObject() {
        let frames = this.animations[this.currentAnimation]?.frames
        if (frames) {
            return frames[this.currentFrameIndex]?.image
        }
        return null;
    }

    getCurrentFrameDimensions() {
        let frames = this.animations[this.currentAnimation]?.frames
        if (frames) {
            return {width: frames[this.currentFrameIndex]?.width, height: frames[this.currentFrameIndex]?.height} 
        }
        return null;
    }

    advanceFrame() {
        if (!['loop', 'once'].includes(this.animationState)) {
            return;
        }

        let animationDetails =  this.animations[this.currentAnimation];
        if (!animationDetails) {
            return;
        }

        if (this.lastFrameTime > Date.now() - animationDetails.msBetweenFrames) {
            return; // not yet time to advane frame
        }

        this.lastFrameTime = Date.now();

        let maxFrameCount = animationDetails.frames?.length

        if (this.currentFrameIndex < maxFrameCount - 1) {
            this.currentFrameIndex += 1
        }
        else if (this.animationState == 'loop') {
            this.currentFrameIndex = 0;
        }
    }

    pushFrameTo(animationName, frame, frameIndex = -1, width, height) {
        if (!this.animations[animationName]) {
            this.animations[animationName] = {
                frames: []
            }
        }

        if (frameIndex == -1) {
            this.animations[animationName].frames.push({image: frame, width: width, height: height})
        }
        else {
            this.animations[animationName].frames[frameIndex] = {image: frame, width: width, height: height}
        }
    }

    setAnimationState(state) {
        this.animationState = state;
        if (state == 'stopped') {
            this.currentFrameIndex = 0;
        }
    }
}