import { default as Tag } from '@core/tag'

export default class Animatable extends Tag {
    static tagType = 'Animatable'

    constructor() {
      super();
      this.tagType = 'Animatable'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('AnimationComponent');
    };

    advanceFrame() {
      this.entity.getComponent('AnimationComponent').advanceFrame();
    }

    setAnimation(animation) {
      let animationComponent = this.entity.getComponent('AnimationComponent')
      if (animationComponent.currentAnimation != animation) {
        animationComponent.currentAnimation = animation;
        animationComponent.lastFrameTime = Date.now();
        animationComponent.currentFrameIndex = 0;
      }
    }

    setAnimationState(state) {
      this.entity.getComponent('AnimationComponent').setAnimationState(state)
    }

    restartAnimation() {
      let animationComponent = this.entity.getComponent('AnimationComponent')
      if (animationComponent) {
        animationComponent.lastFrameTime = Date.now();
        animationComponent.currentFrameIndex = 0;
      }
    }
}
  