import { default as System } from '@core/system';

export default class TimerSystem extends System {
    constructor() {
      super();
    }
    
    work() {
      this.workForTag('Timer', (tag, entity) => {
        if (tag.isTime()) {
          if (tag.getOnEndEffect() == 'destroy_entity') {
            this._core.removeEntity(entity);
          }
          else if (typeof tag.getOnEndEffect() == 'function') {
            if (tag.getOnEndEffect()()) {
              tag.removeTimer();
              this._core.removeEntity(entity);
            }
            else {
              tag.removeTimer();
            }
          }
        }
      })
    };
  }  