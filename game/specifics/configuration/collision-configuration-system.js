import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class CollisionConfigurationSystem extends System {
    constructor() {
        super()
        this.collidables = {
          'none': ['none'],
          'default': ['enemy', 'character', 'wall'],
          'character': ['enemy', 'wall'],
          'enemy': ['character', 'wall', 'default', 'enemy']
        }
    }
    
    work() {
        if (!this._core.getData('CONFIG_COLLISION_GROUPS')) {
            this._core.publishData('CONFIG_COLLISION_GROUPS', this.collidables)
        }
    };
  }