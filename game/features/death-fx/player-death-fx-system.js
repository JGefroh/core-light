import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';
import RenderComponent from '@game/engine/renderer/render-component';
import TimerComponent from '@game/engine/timer/timer-component';
import CollisionComponent from '@game/engine/collision/collision-component';

export default class PlayerDeathFxSystem extends System {
    constructor() {
        super()
        this.audio = [
        ]

        this.addHandler('PLAYER_DEATH_FX_REQUESTED', (payload) => {
            this.executePlayerDeath(payload.entity, payload.xPosition, payload.yPosition, payload.angleDegrees);
        });

        this.addHandler('INPUT_RECEIVED', (payload) => {
            if (payload.action == 'debug_kill') {
                let entity = this._core.getEntityWithKey('pc')
                let xPosition = entity.getComponent('PositionComponent').xPosition
                let yPosition = entity.getComponent('PositionComponent').yPosition
                let angleDegrees = entity.getComponent('PositionComponent').angleDegrees
                this.executePlayerDeath(entity, xPosition, yPosition, angleDegrees);
            }
        })
    }

    work() {
    }

    executePlayerDeath(entity, xPosition, yPosition, angleDegrees) {
        let light = this._createPlayerFlashlight(xPosition, yPosition, angleDegrees);
        this._playAudio(xPosition, yPosition)
        this._showGore(xPosition, yPosition, 60)
        this._showGore(xPosition, yPosition, 60, true)
        this._showBlood(xPosition, yPosition)
        this._dropBody(entity);
        this._core.removeEntity(entity)
        this._showGameOver();
        setTimeout(() => {
            window.location.reload();
        }, 5000)
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

    _playAudio(xPosition, yPosition) {
        let deathSounds = [
            'scream-1.mp3',
            'scream-2.mp3',
            'scream-3.mp3',
            'scream-4.mp3'
        ]
        this.send("PLAY_AUDIO", {
            audioKey: this._randomFrom(deathSounds),
            sourceXPosition: xPosition,
            sourceYPosition: yPosition,
            decibels: 50
        })
        this.send("PLAY_AUDIO", {
            audioKey: 'clatter-1.mp3',
            sourceXPosition: xPosition,
            sourceYPosition: yPosition,
            decibels: 50
        })
    }

    _showGore(xPosition, yPosition, amount, green) {
        for (let i = 0; i < amount; i++) {
            let randomMagnitude = Math.random() * 10
            let spread = 360;
            let randomAngle = (Math.random() * spread - spread / 2);
            let width = Math.random() * 8
            let height = Math.random() * 4;
            let color = this._randomFrom([
                '#8B0000', // dark red
                '#A10000',
                '#B22222',
                '#5C0A0A'  // dried blood
            ]);
            let meatChunk = this._randomFrom([
                'MEAT_CHUNK_1',
                'MEAT_CHUNK_2',
                'MEAT_CHUNK_3',
                'MEAT_CHUNK_4',
            ])
            if (green) {
                color = this._randomFrom([
                    '#556B2F', // dark olive green
                    '#6B8E23', // base olive
                    '#7A9E38', // slightly brighter/lusher
                    '#3C4F1A'  // deep forest / muted
                ]);
                meatChunk = null;
            }
            else {
                width += 2;
                height += 2;
            }

            let entity = new Entity()
            entity.addComponent(new PositionComponent(
                {
                    width: width,
                    height: height,
                    xPosition: xPosition,
                    yPosition: yPosition,
                    angleDegrees: Math.random() * 360
                }
            ));
            entity.addComponent(new RenderComponent({
                width: width,
                height: height,
                shape: 'rectangle',
                shapeColor: color,
                imagePath: meatChunk,
                renderLayer: 'LOWER_DECOR'
            }))
            let vectorComponent = new VectorComponent({
                bleedAmount: 0.1 + (Math.random() * 0.3)
            });
            vectorComponent.addVector(randomMagnitude, randomAngle);
            entity.addComponent(vectorComponent)

            this._core.addEntity(entity);
        }
    }

    _showBlood(xPosition, yPosition) {
        let size = 24 + Math.random() * 20;
        this.send('CREATE_PROP', {type: `BLOOD_POOL_RANDOM`, xPosition: xPosition, yPosition: yPosition, width: size, height: size, angleDegrees: 'random'})
    }

    _createPlayerFlashlight(x, y, angleDegrees) {
        let entity = new Entity()
        let size = 16;
        let oppositeAngleDegrees = (angleDegrees + 180) % 360
        entity.addComponent(new PositionComponent(
            {
                width: size,
                height: size,
                xPosition: x,
                yPosition: y,
                angleDegrees: angleDegrees
            }
        ));
        entity.addComponent(new LightSourceComponent({
            lightType: 'cone',
            lightStyle: 'flicker',
            lightRefresh: 'dynamic',
            flickerOffMinimumLengthMs: 10,
            flickerOffRandomMs: 200,
            flickerOnRandomMs: 100,
            flickerOnMinimumLengthMs: 1000,
            maxDistance: 200,
            coneDegrees: 45,
        }))
        entity.addComponent(new CollisionComponent({
            collisionGroup: 'default',
            collisionShape: 'circle'
        }))
        let vector = new VectorComponent({
            turnMagnitude: 10,
        })
        vector.addVector(3, oppositeAngleDegrees);
        entity.addComponent(new TimerComponent({
            time: 300,
            onEndEffect: () => {
                vector.bleedAmount = 0.06;
            }
        }));
        entity.addComponent(vector);
        this._core.addEntity(entity);
    }


    _showGameOver() {
        this.send("ADD_GUI_RENDERABLE", {
            key: 'GAME_OVER',
            text: 'YOU DIED - GAME OVER',
            xPosition: (window.innerWidth / 2) - 300,
            yPosition: window.innerHeight / 4,
            width: 1000,
            height: 500,
            fontSize: 50,
            fontColor: 'red'
        })
    }
    _randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

