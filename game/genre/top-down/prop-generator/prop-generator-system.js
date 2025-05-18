import { default as System } from '@core/system';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js'

import CollisionComponent from '@game/engine/collision/collision-component';
import ShadowComponent from '@game/engine/lighting/shadow-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';

/**
 * This system generates props at a specific location.
 * Props are pre-defined objects.
 * 
 * You can define a pop with an image or a sequence of Renderables.
 * 
 * To define a prop:
 * ...via image: 
 *      {type: 'BLOOD_POOL', imageKey: 'BLOOD_POOL_2}
 * ...via sequence of Renderables: 
 *      { "type": "LIGHT_FIXTURE", "width": 80, "height": 40, "parts": [{"x":-20,"y":0,"width":40,"height":40,"shape":"rect","color":"#2C2C2C"}, ...and so on]}
 * 
 * To create a prop after defining it:
 * ...send a CREATE_PROP request:
 *      {type: 'BLOOD_POOL', xPosition: 436, yPosition: -373, width: 20, height: 20, angleDegrees: 'random', collision: 'wall', shadow: true, hitscan: true}
 * 
 * When definin a prop with an image, it ties into the Asset and Texture pipeline. 
 * ...The `type` is a developer-defined key for that prop. 
 * ...You can define a prop by passing in an Image key that maps to an Asset:
 *      Asset: {'BLOOD_POOL_2': { path: 'blood-pool-2.png' } // Defines an image texture with the key 'BLOOD_POOL_2' - accepts .json or images in path.
 *      Prop:  {type: 'BLOOD_POOL', imageKey: 'BLOOD_POOL_2} // Defines a prop called 'BLOOD_POOL' that uses the image from above.
 */

export default class PropGeneratorSystem extends System {
    constructor() {
        super()
        this.propMap = {};

        this.addHandler('CREATE_PROP', (payload) => {
            this.createProp(payload)
        });

        this.addHandler('DEFINE_PROP', (payload) => {
            this.defineProp(payload);
        });
    }

    work() {
    }

    createProp(propRequest) {
        if (!this.propMap[propRequest.type]) {
            console.warn(`PropGeneratorSystem: Unknown prop - ${propRequest.type}, retrying in 1000ms...`);
            setTimeout(() => {this.createProp(propRequest)}, 1000)
            return;
        }
    
        let propAngle = propRequest.angleDegrees === 'random' ? Math.random() * 360 : propRequest.angleDegrees || 0;
    
        const propDetails = this.propMap[propRequest.type];
    
        if (propRequest.shadow || propRequest.collision) {
            this._createShadowProp(
                propRequest.xPosition,
                propRequest.yPosition,
                propRequest.width,
                propRequest.height,
                propAngle,
                propRequest
            );
        }

        if (propDetails.parts) {
            propDetails.parts.forEach((part) => {
                const scaleX = propRequest.width / propDetails.width;
                const scaleY = propRequest.height / propDetails.height;
        
                const globalAngleRad = propAngle * Math.PI / 180;
                const partAngleRad = (part.angleDegrees || 0) * Math.PI / 180;
                const totalAngleRad = globalAngleRad + partAngleRad;
        
                const cosA = Math.cos(globalAngleRad);
                const sinA = Math.sin(globalAngleRad);
        
                // Scale local position
                const localX = part.x * scaleX;
                const localY = part.y * scaleY;
        
                // Rotate local position around (0,0) using only global rotation
                const rotatedX = localX * cosA - localY * sinA;
                const rotatedY = localX * sinA + localY * cosA;
        
                // Translate to final world position
                const finalX = propRequest.xPosition + rotatedX;
                const finalY = propRequest.yPosition + rotatedY;
        
                // Scale dimensions
                const scaledWidth = part.width * scaleX;
                const scaledHeight = part.height * scaleY;
        
                // Create the part using full part + prop rotation
                this._createPropPart(
                    part.shape,
                    finalX,
                    finalY,
                    scaledWidth,
                    scaledHeight,
                    totalAngleRad * 180 / Math.PI,
                    part.color,
                    part
                );
            });
        }
        else if (propDetails.imageKey) {
            this._createPropImage(
                propDetails.imageKey,
                propRequest.xPosition,
                propRequest.yPosition,
                propRequest.width,
                propRequest.height,
                propAngle|| 0
            );   
        }
    }

    _createPropImage(imageKey, xPosition, yPosition, width, height, angleDegrees) {
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
            renderLayer: 'PROP',
            imagePath: imageKey
        }))
        this._core.addEntity(entity);
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

    defineProp(propDefinition) {
        this.propMap[propDefinition.type] = propDefinition
    }
}