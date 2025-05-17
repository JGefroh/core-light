import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import VectorComponent from '@game/engine/movement/vector-component';
import TimerComponent from '@game/engine/timer/timer-component';


export default class FootstepFxSystem extends System {
    constructor() {
      super()
      this.audio = [
        'footstep-1.mp3',
        'footstep-2.mp3',
        'footstep-3.mp3',
        'footstep-4.mp3',
      ]
    }
    
    work() {
      this.workForTag('HasFootsteps', (tag) => {
        if (tag.isMoving()) {
          this.send("PLAY_AUDIO", {audioKey: this._getRandomFrom(this.audio), exclusiveGroup: 'footstep', exclusive: true, volume: 0.3, endAt: 0.5}); 
        }
        else {
          this.send("STOP_AUDIO", {audioKey: 'footstep-1.mp3', group: 'footstep'})
          this.send("STOP_AUDIO", {audioKey: 'footstep-2.mp3', group: 'footstep'})
          this.send("STOP_AUDIO", {audioKey: 'footstep-3.mp3', group: 'footstep'})
          this.send("STOP_AUDIO", {audioKey: 'footstep-4.mp3', group: 'footstep'})
        }
      });
    }

    _getRandomFrom(collection) {
        return collection[Math.floor(Math.random() * collection.length)]
    }
  }