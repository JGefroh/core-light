import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';
import RenderComponent from '@game/engine/renderer/render-component';
import TimerComponent from '@game/engine/timer/timer-component';
import CollisionComponent from '@game/engine/collision/collision-component';

export default class EnemyDeathFxSystem extends System {
    constructor() {
        super()
        this.audio = [
        ]

        this.addHandler('REQUEST_ENEMY_DEATH_FX', (payload) => {
            this.executeEnemyDeath(payload.entity, payload.xPosition, payload.yPosition, payload.angleDegrees);
        });
    }

    work() {
    }

    executeEnemyDeath(entity, xPosition, yPosition, angleDegrees) {
        this._dropBody(entity);
        this._playAudio(entity, xPosition, yPosition);
    }

    _playAudio(entity, xPosition, yPosition) {
        let enemyDeath = [
            'enemy-zombie-death-1.mp3',
            'enemy-zombie-death-2.mp3',
            'enemy-zombie-death-3.mp3',
            'enemy-zombie-death-4.mp3'
        ]
        this.send("PLAY_AUDIO", {
            audioKey: this._getRandomFrom(enemyDeath),
            sourceXPosition: xPosition,
            sourceYPosition: yPosition,
            decibels: 50
        })
    }

    _dropBody(entity) {
        let corpseEntity = new Entity();
        let render = entity.getComponent('RenderComponent');
            render.shapeColor = 'rgba(74, 74, 74, 1)'
            render.renderLayer = 'PROP'
        corpseEntity.addComponent(render);
        corpseEntity.addComponent(entity.getComponent('PositionComponent'));
        this._core.addEntity(corpseEntity)
    }

    _getRandomFrom(collection) {
        return collection[Math.floor(Math.random() * collection.length)]
    }
}

