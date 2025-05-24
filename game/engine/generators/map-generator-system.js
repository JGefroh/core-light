import { default as System } from '@core/system';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js'

import CollisionComponent from '@game/engine/collision/collision-component';
import ShadowComponent from '@game/engine/lighting/shadow-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';

export default class MapGeneratorSystem extends System {
    constructor() {
        super()

        this.addHandler('LOAD_MAP', (map) => {
            this.loadMap(map);
        })
    }

    work() {

    }

    loadMap(map) {
        map.xPosition ||= 0;
        map.yPosition ||= 0;

        this._addFloors(map);
        this._addWalls(map);
        this._addProps(map);
        this._addLights(map);
        this._addEnemies(map);
    }

    _addFloors(map) {
        map.floors.forEach((floor) => {
            this._addFloor({
                xPosition: floor.xPosition + map.xPosition,
                yPosition: floor.yPosition + map.yPosition,
                width: floor.width,
                height: floor.height,
                color: floor.color
            });
        });
    }

    _addWalls(map) {
        let previousTo = [0, 0]; // default start if no previous 'to'

        map.walls.forEach((wall) => {
            const WALL_THICKNESS = 16;
            let size = wall.size || WALL_THICKNESS;
            let color = wall.color;

            let from = wall.from || previousTo;
            let to = wall.to;

            if (!to) {
                // Treat as relative offset
                const offset = wall.offset || [0, 0];
                to = [from[0] + offset[0], from[1] + offset[1]];
            }

            const dx = to[0] - from[0];
            const dy = to[1] - from[1];

            const lengthX = Math.abs(dx);
            const lengthY = Math.abs(dy);

            const centerX = (from[0] + to[0]) / 2;
            const centerY = (from[1] + to[1]) / 2;

            let width, height;

            if (dx === 0 && dy !== 0) {
                width = size || WALL_THICKNESS;
                height = lengthY;
            } else if (dy === 0 && dx !== 0) {
                width = lengthX;
                height = size || WALL_THICKNESS;
            } else {
                return; // skip diagonals or zero length
            }

            if (!wall.clear) {
                // A clear slot doesn't have a wall.
                this._addWall({
                    xPosition: centerX + map.xPosition,
                    yPosition: centerY + map.yPosition,
                    width: width,
                    height: height,
                    color: color
                });
            }

            previousTo = to;
        });
    }

    _addProps(map) {
        map.props.forEach((prop) => {
            if (!prop.type) {
                this._addProp({
                    xPosition: prop.xPosition + map.xPosition,
                    yPosition: prop.yPosition + map.yPosition,
                    width: prop.width,
                    height: prop.height
                });
            }
            else {
                prop.xPosition += map.xPosition;
                prop.yPosition += map.yPosition;
                this.send('CREATE_PROP', prop)
            }
            
        });
    }
    _addLights(map) {
        map.lights.forEach((light) => {
            this._addLight({
                xPosition: light.xPosition + map.xPosition,
                yPosition: light.yPosition + map.yPosition,
                radius: light.radius,
                type: light.type,
                angleDegrees: light.angleDegrees,
                coneDegrees: light.coneDegrees,
                colors: light.colors
            });
        });
    }

    _addEnemies(map) {
        map.enemies.forEach((enemy) => {
            enemy.xPosition += map.xPosition;
            enemy.yPosition += map.yPosition;
            this.send('CREATE_ENEMY', enemy)
        });
    }


    _addLight(lightDefinition) {
        let x = lightDefinition.xPosition;
        let y = lightDefinition.yPosition;
        let radius = lightDefinition.radius;
        let lightType = lightDefinition.type;
        let angleDegrees = lightDefinition.angleDegrees;
        let coneDegrees = lightDefinition.coneDegrees;

        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                xPosition: x,
                yPosition: y + 9,
                angleDegrees: angleDegrees
            }
        ));
        entity.addComponent(new LightSourceComponent({
            lightType: lightType,
            maxDistance: radius,
            coneDegrees: coneDegrees || 45,
            colors: lightDefinition.colors
        }))
        this._core.addEntity(entity);
    }

    _addFloor(floorDefinition) {
        let x = floorDefinition.xPosition;
        let y = floorDefinition.yPosition;
        let width = floorDefinition.width;
        let height = floorDefinition.height;
        let color = floorDefinition.color;
        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: width,
                height: height,
                xPosition: x,
                yPosition: y,
            }
        ));
        entity.addComponent(new RenderComponent({
            width: width,
            height: height,
            shape: 'rectangle',
            shapeColor: color,
            angleDegrees: 0, // Used to override the facing direction for positional logic
            renderLayer: 'TERRAIN'
        }))
        this._core.addEntity(entity);
    }

    _addWall(wallDefinition) {
        let width = wallDefinition.width;
        let height = wallDefinition.height;
        let xPosition = wallDefinition.xPosition;
        let yPosition = wallDefinition.yPosition;

        let color = wallDefinition.color || 'rgba(32, 40, 57, 1)'
        let borderColor = 'rgba(0, 2, 16, 1)'
        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: width,
                height: height,
                xPosition: xPosition,
                yPosition: yPosition,
            }
        ));
        entity.addComponent(new RenderComponent({
            width: width,
            height: height,
            shape: 'rectangle',
            shapeColor: color,
            angleDegrees: 0, // Used to override the facing direction for positional logic
            renderLayer: 'WALL',
            borderColor: borderColor,
            borderSize: borderColor ? 1.5 : 0
        }))
        entity.addComponent(new ShadowComponent());
        entity.addComponent(new CollisionComponent({ collisionGroup: 'wall' }))
        entity.addComponent(new HitscanTargetComponent());
        this._core.addEntity(entity);
    }

    _addProp(propDefinition) {
        let width = propDefinition.width;
        let height = propDefinition.height;
        let xPosition = propDefinition.xPosition;
        let yPosition = propDefinition.yPosition;

        let color = 'rgba(32, 40, 57, 1)'
        let borderColor = 'rgba(0, 2, 16, 1)'
        let entity = new Entity()
        entity.addComponent(new PositionComponent(
            {
                width: width,
                height: height,
                xPosition: xPosition,
                yPosition: yPosition,
            }
        ));
        entity.addComponent(new RenderComponent({
            width: width,
            height: height,
            shape: 'rectangle',
            shapeColor: color,
            angleDegrees: 0, // Used to override the facing direction for positional logic
            renderLayer: 'PROP',
            borderColor: borderColor,
            borderSize: borderColor ? 1.5 : 0
        }))
        entity.addComponent(new ShadowComponent());
        entity.addComponent(new CollisionComponent({ collisionGroup: 'wall' }))
        entity.addComponent(new HitscanTargetComponent());
        this._core.addEntity(entity);
    }
}