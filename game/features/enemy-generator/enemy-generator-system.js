import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import CollisionComponent from '@game/engine/collision/collision-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import AiComponent from '@game/engine/ai/ai-component';
import MaterialComponent from '@game/engine/material/material-component';
import HealthComponent from '../../genre/combat/health-component';
import TrailEmitterComponent from '../trail-fx/trail-emitter-component';


export default class EnemyGeneratorSystem extends System {
    constructor() {
        super()

        this.enemyCount = null;
        this.wait = 1000;

        this.enemyType = {
            'normal': {shapeColor: 'rgba(255, 0, 35, 1)', maxMagnitude: 3, bleedAmount: 0.3, size: 16, health: 150},
            'normal_fast': {shapeColor: 'rgba(139, 0, 0, 1)', maxMagnitude: 6, bleedAmount: 0.1, size: 16, health: 150},
            'swarm': {shapeColor: 'rgba(255, 0, 35, 1)', maxMagnitude: 3, bleedAmount: 0.3, size: 10, health: 50},
            'swarm_fast': {shapeColor: 'rgba(139, 0, 0, 1)', maxMagnitude: 3, bleedAmount: 0.1, size: 10, health: 50},
            'armored': {shapeColor: 'rgba(255, 0, 35, 1)', maxMagnitude: 2, bleedAmount: 0.3, size: 20, health: 1000}
        }

        this.addHandler('CREATE_ENEMY', (payload) => {
            this._addEnemy(payload.xPosition, payload.yPosition, payload)
            if (this.enemyCount == null) {
                this.enemyCount = 0;
            }
            this.enemyCount++;
            this._core.publishData('ENEMY_COUNT', this.enemyCount)
        })
    }

    work() {
        this._core.publishData('ENEMY_COUNT', this.enemyCount)
    }
    
    _addEnemy(x, y, options = {}) {
        let entity = new Entity()

        let enemyType = options.type || 'normal'
        let shapeColor = this.enemyType[enemyType].shapeColor; 
        let maxMagnitude = this.enemyType[enemyType].maxMagnitude;
        let bleedAmount = this.enemyType[enemyType].bleedAmount
        let size = this.enemyType[enemyType].size;
        let health = this.enemyType[enemyType].health || 150;

        let attackSounds = [
            'zombie-attack-1.mp3',
            'zombie-attack-2.mp3',
            'zombie-attack-3.mp3',
            'zombie-attack-4.mp3'
        ]
        let position = new PositionComponent(
            {
                width: size,
                height: size,
                xPosition: x,
                yPosition: y,
                angleDegrees: 90
            }
        )
        entity.addComponent(position);
        let render = new RenderComponent({
            width: size,
            height: size,
            shape: 'circle',
            shapeColor: shapeColor,
            borderColor: 'rgba(12, 12, 14, 1)',
            borderSize: health / 100
        })
        entity.addComponent(render)
        entity.addComponent(new CollisionComponent({
            collisionGroup: 'enemy',
            collisionShape: 'circle',
            onCollision: (collidable) => {
                if (collidable.getCollisionGroup() == 'character') {
                    let playerEntity = collidable.getEntity()
                    if (!playerEntity || !playerEntity.id) {
                        return;
                    }
                    this.send("REQUEST_DAMAGE", {entity: playerEntity, amount: 50, onDamage: () => {
                        this._core.send("PLAY_AUDIO", {
                            audioKey: this._randomFrom(attackSounds),
                            sourceXPosition: position.xPosition,
                            sourceYPosition: position.yPosition,
                            decibels: 50
                        })
                    }})
                }
            }
        }))
        entity.addComponent(new HitscanTargetComponent());
        entity.addComponent(new MaterialComponent({
            materialType: 'flesh'
        }));
        entity.addComponent(new VectorComponent({
            maxMagnitude: maxMagnitude,
            bleedAmount: bleedAmount
        }));
        entity.addComponent(new AiComponent({
            goal: 'goal_attack'
        }));
        entity.addComponent(new TrailEmitterComponent({
            trailFrequencyMs: enemyType.indexOf('fast') == -1 ? 1500 : 500
        }));

        entity.addComponent(new HealthComponent({
            health: health,
            onHealthZero: (entity, health) => {
                this.send('REQUEST_ENEMY_DEATH_FX', {
                    entity: entity, 
                    xPosition: position.xPosition, 
                    yPosition: position.yPosition, 
                    angleDegrees: position.angleDegrees
                });
                this._core.removeEntity(entity)
                this.enemyCount--;
            },
            onHealthLoss: (entity, health) => {
                render.borderSize = health / 100;
            }
        }));
        this._core.addEntity(entity);
    }
    
    _randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
