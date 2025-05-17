import { default as System } from '@core/system';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js'

import CollisionComponent from '@game/engine/collision/collision-component';
import ShadowComponent from '@game/engine/lighting/shadow-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';

import { default as mapWarehouse } from '../map-generator/maps/map-warehouse';

import { default as cardboardBox } from './props/cardboard-box';
import { default as pallet } from './props/pallet';
import { default as metalShelfTop } from './props/metal-shelf-top';
import { default as coneTop } from './props/cone-top';


export default class PropGeneratorSystem extends System {
    constructor() {
        super()
        this.definePropMap();
        this.addHandler('CREATE_PROP', (payload) => {
            this.createProp(payload)
        });
    }

    work() {
    }

    createProp(propRequest) {
        if (!this.propMap[propRequest.type]) {
            console.warn(`PropGeneratorSystem: Unknown prop - ${propRequest.type}`)
            return;
        }

        let propAngle = propRequest.angleDegrees == 'random' ? Math.random() * 360 : propRequest.angleDegrees;

        let propDetails = this.propMap[propRequest.type];
        if (propRequest.shadow || propRequest.collision) {
            this._createShadowProp(propRequest.xPosition, propRequest.yPosition, propRequest.width, propRequest.height, propAngle, propRequest);
        }

        propDetails.parts.forEach((part) => {
            const scaleX = propRequest.width / propDetails.width;
            const scaleY = propRequest.height / propDetails.height;
            const angle = (propAngle || 0) * Math.PI / 180;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            // Apply scaling
            const localX = part.x * scaleX;
            const localY = part.y * scaleY;

            // Apply rotation around center (0,0)
            const rotatedX = localX * cosA - localY * sinA;
            const rotatedY = localX * sinA + localY * cosA;

            // Translate to final position
            const scaledX = propRequest.xPosition + rotatedX;
            const scaledY = propRequest.yPosition + rotatedY;

            const scaledWidth = part.width * scaleX;
            const scaledHeight = part.height * scaleY;
        
            this._createPropPart(part.shape, scaledX, scaledY, scaledWidth, scaledHeight, propAngle, part.color, part);
        });
    }

    _createShadowProp(xPosition, yPosition, width, height, angleDegrees, options) {
        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: width,
                height: height,
                xPosition: xPosition,
                yPosition: yPosition,
                angleDegrees: angleDegrees
            }
        ));
        entity.addComponent(new RenderComponent({
            width: width,
            height: height,
            shape: 'rectangle',
            shapeColor: 'rgba(0,0,0,0)',
            renderLayer: 'PROP'
        }))
        if (options.shadow) {
            entity.addComponent(new ShadowComponent())
        }
        if (options.collision) {
            entity.addComponent(new CollisionComponent({
                collisionGroup: options.collision || 'wall'
            }))
        }
        if (options.hitscan) {
            entity.addComponent(new HitscanTargetComponent())
        }

        this._core.addEntity(entity);
    }

    _createPropPart(shape, xPosition, yPosition, width, height, angleDegrees, color, options = {}) {
        let borderColor = 'rgba(0, 2, 16, 1)'
        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: width,
                height: height,
                xPosition: xPosition,
                yPosition: yPosition,
                angleDegrees: angleDegrees
            }
        ));
        entity.addComponent(new RenderComponent({
            width: width,
            height: height,
            shape: shape || 'rectangle',
            shapeColor: color,
            renderLayer: 'PROP',
            borderColor: borderColor,
            borderSize: options.borderSize != null ? options.borderSize : (borderColor ? 1.5 : 0)
        }))
        this._core.addEntity(entity);
    }

    definePropMap() {
        this.propMap = {};

        this.defineProp(cardboardBox);
        this.defineProp(pallet);
        this.defineProp(metalShelfTop);
        this.defineProp(coneTop);
    }

    defineProp(propDefinition) {
        this.propMap[propDefinition.type] = propDefinition
    }
}