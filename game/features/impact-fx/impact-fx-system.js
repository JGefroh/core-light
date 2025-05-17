import { default as System } from '@core/system';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js'

import { default as Colors } from '@game/engine/util/colors.js'

import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import VectorComponent from '@game/engine/movement/vector-component';
import TimerComponent from '@game/engine/timer/timer-component';


export default class ImpactFxSystem extends System {
    constructor() {
        super()

        this.addHandler('IMPACT_FX_REQUESTED', (payload) => {
            this.generateImpactFx(payload);
        });
    }

    work() {
    }

    generateImpactFx(payload) {
        let hasMaterial = false;

        this.workForEntityWithTag(payload.entity?.id, 'Material', (entity, tag) => {
            if (tag.getMaterialType() == 'flesh') {
                const hits = Math.floor(Math.random() * 12) + 20;
                hasMaterial = true;
                for (let i = 0; i < hits; i++) {
                    this.generateBulletPersonHitGiblets(payload.entity, payload.xPosition, payload.yPosition, payload.angleDegrees, true)

                }
            }
        })

        if (!hasMaterial) {
            const hits = Math.floor(Math.random() * 12) + 4;
            for (let i = 0; i < hits; i++) {
                this.generateBulletWallHit(payload.entity, payload.xPosition, payload.yPosition, payload.angleDegrees);
            }
        }
        let audioImpact = [
            'impact-wall-1.mp3',
            'impact-wall-2.mp3',
            'impact-wall-3.mp3',
            'snap-1.mp3',
            'snap-2.mp3',
            'snap-3.mp3',
            'snap-4.mp3'
        ]
        let audioDebris = [
            'debris-1.mp3',
            'debris-2.mp3',
            'debris-3.mp3'
        ]
        this.send("PLAY_AUDIO", {
            audioKey: this._getRandomFrom(audioImpact),
            sourceXPosition: payload.xPosition,
            sourceYPosition: payload.yPosition,
            decibels: 120
        })
        this.send("PLAY_AUDIO", {
            audioKey: this._getRandomFrom(audioDebris),
            sourceXPosition: payload.xPosition,
            sourceYPosition: payload.yPosition,
            decibels: 30
        })

        this._handleWallImpact(payload.entity, payload.xPosition, payload.yPosition, 18, 18)
    }

    _getRandomFrom(collection) {
        return collection[Math.floor(Math.random() * collection.length)]
    }

    generateBulletPersonHitGiblets(entityHit, xPosition, yPosition, angleDegrees, detonate) {
        let randomMagnitude = Math.random() * 10
        let spread = detonate ? 360 : 20; // degrees
        let randomAngle = angleDegrees + (Math.random() * spread - spread / 2);
        let width = Math.random() * 8
        let height = Math.random() * 4;
        let color = this._randomFrom([
            '#8B0000', // dark red
            '#A10000',
            '#B22222',
            '#5C0A0A'  // dried blood
        ]);

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
            shape: 'blob',
            shapeColor: color,
            renderLayer: 'PROP'
        }))
        // entity.addComponent(new TimerComponent({
        //     time: 100 + (200 * Math.random())
        // }));

        let vectorComponent = new VectorComponent({
            bleedAmount: 0.1 + (Math.random() * 0.3)
        });
        vectorComponent.addVector(randomMagnitude, randomAngle);
        entity.addComponent(vectorComponent)

        this._core.addEntity(entity);
    }

    generateBulletWallHit(entityHit, xPosition, yPosition, angleDegrees) {
        let randomMagnitude = Math.random() * 5
        let randomAngle = Math.random() * 360
        let size = Math.random() * 4;
        let color = '#00FF00';

        if (entityHit.getComponent('RenderComponent')) {
            color = new Colors().random(entityHit.getComponent('RenderComponent').shapeColor);
        }

        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: size,
                height: size,
                xPosition: xPosition,
                yPosition: yPosition,
                angleDegrees: Math.random() * 360
            }
        ));
        entity.addComponent(new RenderComponent({
            width: size,
            height: size,
            shape: 'rectangle',
            shapeColor: color,
            angleDegrees: Math.random() * 360, // Used to override the facing direction for positional logic
            renderLayer: 'LOWER_DECOR'
        }))
        // entity.addComponent(new TimerComponent({
        //     time: 100 + (200 * Math.random())
        // }));

        let vectorComponent = new VectorComponent({
            bleedAmount: Math.random() * 0.20
        });
        let timerComponent = new TimerComponent({
            time: 1000,
            onEndEffect: () => {
                entity.removeComponent('VectorComponent')
                this._core.updateTags(entity)
            }
        })
        vectorComponent.addVector(randomMagnitude, randomAngle);
        entity.addComponent(vectorComponent)
        entity.addComponent(timerComponent)

        this._core.addEntity(entity);
    }

    _randomFrom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

   _handleWallImpact(entityHit, xPosition, yPosition, length = 18, maxDepth = 4) {
        const position = entityHit.getComponent('PositionComponent');
        if (!position) return;
      
        let wallAngleDegrees = position.angleDegrees;
        let shouldSwapWidthHeight = false;

        if (wallAngleDegrees == 90 || wallAngleDegrees == 270) {
            shouldSwapWidthHeight = true;
        }
        let maxXLeft = position.xPosition - ((shouldSwapWidthHeight ? position.height : position.width) / 2);
        let maxXRight = position.xPosition + ((shouldSwapWidthHeight ? position.height : position.width) / 2);
        let maxYTop = position.yPosition - ((shouldSwapWidthHeight ? position.width : position.height) / 2);
        let maxYBottom = position.yPosition + ((shouldSwapWidthHeight ? position.width : position.height) / 2);

        let impactDirectionX = null;
        let impactDirectionY = null;

        if (xPosition <= maxXLeft) {
            impactDirectionX = 'right'
        }
        else if (xPosition >= maxXRight) {
            impactDirectionX = 'left'
        }
        else {
            impactDirectionX = null; //Likely wasn't hit on the left or right
        }
        
        if (yPosition <= maxYTop) {
            impactDirectionY = 'down'
        }
        else if (yPosition >= maxYBottom) {
            impactDirectionY = 'up'
        }
        else {
            impactDirectionY = null; // Likely wasn't hit on the top or bottom
        }

        if (!impactDirectionX && !impactDirectionY) {
            return;
        }

        if (impactDirectionX) {
            length = shouldSwapWidthHeight ? position.height : position.width;
        }
        else {
            length = shouldSwapWidthHeight ? position.width : position.height;
        }

        // Now generate the crack
        this._createWallCrack(entityHit, xPosition, yPosition, length, impactDirectionX || impactDirectionY, maxDepth);
      }

      _createWallCrack(entityHit, xPosition, yPosition, length = 18, direction = 'down', maxDepth = 4) {
        const segments = 6 + Math.floor(Math.random() * 2);
        const segmentLength = length / segments;
        let totalTravel = 0;
      
        let x = xPosition;
        let y = yPosition;
        const points = [{ x, y }];
      
        
        let dirX = 0, dirY = 0;
        switch (direction) {
          case 'down':  dirY = 1; break;
          case 'up':    dirY = -1; break;
          case 'left':  dirX = -1; break;
          case 'right': dirX = 1; break;
        }
      
        for (let i = 0; i < segments; i++) {
          const remaining = length - totalTravel;
          if (remaining <= 0) break;
      
          const move = Math.min(segmentLength, remaining);
          const jitter = (Math.random() - 0.5) * 6;
      
          const dx = dirX * move + (dirY !== 0 ? jitter : 0);
          const dy = dirY * move + (dirX !== 0 ? jitter : 0);
      
          x += dx;
          y += dy;
          totalTravel += move;
      
          points.push({ x, y });
      
          if (i > 1 && Math.random() < 0.2 && maxDepth > 0 && totalTravel < length - 6) {
            const fork = this._createLightningFork(x, y, maxDepth - 1, length - totalTravel, direction);
            points.push(...fork);
          }
        }
      
        const crackEntity = new Entity();
      
        // Position is optional for renderer, but still useful for ECS system logic
        crackEntity.addComponent(new PositionComponent({
          xPosition,
          yPosition,
          width: 1,
          height: length,
          angleDegrees: 0
        }));
      
        crackEntity.addComponent(new RenderComponent({
          shape: 'path',
          shapeColor: 'rgba(0,0,0,1)',
          renderLayer: 'PROP',
          width: 1,
          height: length,
          pathPoints: points
        }));
      
        this._core.addEntity(crackEntity);
      }


    /// WALL DAMAGE
    _createLightningFork(x, y, depth, remainingLength, direction = 'down') {
        const forkPoints = [];
        const forkLength = Math.min(6 + Math.random() * 4, remainingLength);
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        const segments = 2 + Math.floor(Math.random() * 2);

        let px = x;
        let py = y;

        for (let i = 0; i < segments; i++) {
            const dx = forkLength / segments * Math.cos(angle + (Math.random() - 0.5) * 0.3);
            const dy = forkLength / segments * Math.sin(angle + (Math.random() - 0.5) * 0.3);

            const projectedDy = direction === 'down' ? py + dy - y : y - (py + dy);
            if (projectedDy > remainingLength) break;

            px += dx;
            py += dy;
            forkPoints.push({ x: px, y: py });
        }

        return forkPoints;
    }
}