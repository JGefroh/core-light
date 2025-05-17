import { default as Tag } from '@core/tag'

export default class Timer extends Tag{
    static tagType = 'Timer'

    constructor() {
        super()
        this.tagType = 'Timer'
    }

    static isAssignableTo(entity) {
      return entity.hasComponent('TimerComponent')
    };

    isTime() {
      return (Date.now() - this.entity.getComponent('TimerComponent').startedAt >= this.entity.getComponent('TimerComponent').time)
    }

    getOnEndEffect() {
      return this.entity.getComponent('TimerComponent').onEndEffect
    }

    removeTimer() {
      this.entity.removeComponent('TimerComponent');
    }
  }
  