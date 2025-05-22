import { default as System } from '@core/system';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js'

import { default as Colors } from '@game/engine/util/colors.js'

import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import VectorComponent from '@game/engine/movement/vector-component';
import TimerComponent from '@game/engine/timer/timer-component';


export default class LaserAimSystem extends System {
    constructor() {
        super()
    }

    work() {
        this.workForTag('PlayerControllable', (tag) => {
            let controllable = tag.getEntity();
            let positionComponent = controllable.getComponent('PositionComponent');
            
            this.send("HITSCAN_REQUESTED", {
                originX: positionComponent.xPosition,
                originY: positionComponent.yPosition,
                angleDegrees: positionComponent.angleDegrees,
                range: 166,
                callback: (result) => {
                    this._updateLaserPosition(result);
                }
            })
        });
    }

    _updateLaserPosition(hitscanResult) {
        let entity = this._core.getEntityWithKey('laser');
        entity.getComponent('PositionComponent').xPosition = hitscanResult.xPosition
        entity.getComponent('PositionComponent').yPosition = hitscanResult.yPosition
    }
}