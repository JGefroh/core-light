import '@core/component';
import { default as Core } from '@core/core';
import { default as Entity } from '@core/entity.js';
import '@core/tag';

import '@game/title/font-loader.js';

import AttachedComponent from '@game/engine/attachments/attached-component';
import CollisionComponent from '@game/engine/collision/collision-component';
import LightSourceComponent from '@game/engine/lighting/light-source-component';
import ShadowComponent from '@game/engine/lighting/shadow-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import HitscanTargetComponent from '@game/engine/hitscan/hitscan-target-component';
import VectorComponent from '@game/engine/movement/vector-component';
import PlayerControlComponent from '@game/features/player-control/player-control-component';
import TurnsTowardsComponent from '@game/features/turn-towards-cursor/turns-towards-component';
import WeaponComponent from '@game/features/weapons/weapon-component';
import FootstepFxComponent from '@game/features/footstep-fx/footstep-fx-component'
import MaterialComponent from '../engine/material/material-component';
import AiComponent from '@game/engine/ai/ai-component';
import AudioListenerComponent from '../engine/audio/audio-listener-component';
import HealthComponent from '@game/genre/combat/health-component';
import TrailEmitterComponent from '../features/trail-fx/trail-emitter-component';

export function createTestData() {
    let player = addPlayer(310, -450)
    _createRifle(player)
}

function addPlayer(x, y) {
    let entity = new Entity({key: 'pc'})
    
    let size = 16;
    let position = new PositionComponent(
        {
            width: size,
            height: size,
            xPosition: x,
            yPosition: y,
            angleDegrees: -35
        }
    )
    let render = new RenderComponent({
        width: size,
        height: size,
        shape: 'circle',
        shapeColor: 'rgba(107, 142, 35, 1)',
        borderColor: 'rgba(12, 12, 14, 1)',
        borderSize: 1.5,
        renderLayer: 'CHARACTER',
        
    });
    entity.addComponent(position);
    entity.addComponent(render)
    entity.addComponent(new LightSourceComponent({
        lightType: 'point',
        maxDistance: 8,
    }))
    entity.addComponent(new TurnsTowardsComponent({
        turnSpeed: 25
    }));
    entity.addComponent(new VectorComponent({
        maxMagnitude: 1,
        bleedAmount: 0.3
    }));
    entity.addComponent(new PlayerControlComponent())
    entity.addComponent(new CollisionComponent({
        collisionGroup: 'character',
        collisionShape: 'circle',
    }))
    entity.addComponent(new FootstepFxComponent({
    }))
    entity.addComponent(new TrailEmitterComponent());
    entity.addComponent(new HealthComponent({
        health: 150,
        postDamageInvincibilityMs: 1000,
        onHealthLoss: (entity, health) => {
            render.borderSize -= health / 100
            let hurtSounds = [
                'hurt-1.mp3',
                'hurt-2.mp3',
                'hurt-3.mp3',
                'hurt-4.mp3'
            ]
            Core.send("PLAY_AUDIO", {
                audioKey: _randomFrom(hurtSounds),
                sourceXPosition: position.xPosition,
                sourceYPosition: position.yPosition,
                decibels: 50
            })
        },
        onHealthZero: (entity, health) => {
            Core.send('PLAYER_DEATH_FX_REQUESTED', {
                xPosition: position.xPosition,
                yPosition: position.yPosition,
                angleDegrees: position.angleDegrees,
                entity: entity
            })
        }
    }))
    entity.addComponent(new AudioListenerComponent({}))


    _createPlayerFlashlight(x, y, entity);
    _createPlayerLaser(x, y, entity);
    _createPlayerHighlight(x, y, entity);
    Core.addEntity(entity);
    Core.send('INPUT_RECEIVED', {action: 'follow', entityId: entity.id})

    return entity
}

function _createPlayerFlashlight(x, y, playerEntity) {
    let entity = new Entity({key: 'player-flashlight'})
    let size = 16;
    entity.addComponent(new PositionComponent(
        {
            width: size,
            height: size,
            xPosition: x,
            yPosition: y,
        }
    ));
    entity.addComponent(new LightSourceComponent({
        lightType: 'cone',
        maxDistance: 300,
        coneDegrees: 45,
        lightRefresh: 'dynamic'
    }))
    entity.addComponent(new AttachedComponent({ attachedToEntity: playerEntity, sync: ['xPosition', 'yPosition', 'angleDegrees'], attachmentOptions: {xPosition: 0, yPosition: 0, angleDegrees: 0}}));
    Core.addEntity(entity);
}

function _createPlayerHighlight(x, y, playerEntity) {
    let entity = new Entity({key: 'ui-pc-highlight'})
    let size = 16;
    entity.addComponent(new PositionComponent(
        {
            width: size,
            height: size,
            xPosition: x,
            yPosition: y,
        }
    ));
    entity.addComponent(new LightSourceComponent({
        lightType: 'point',
        lightRefresh: 'dynamic',
        angleDegrees: 0,
        maxDistance: 30,
        disableOverride: true,
    }))
    entity.addComponent(new AttachedComponent({ attachedToEntity: playerEntity, sync: ['xPosition', 'yPosition', 'angleDegrees'], attachmentOptions: {xPosition: 0, yPosition: 0, angleDegrees: 0}}));
    Core.addEntity(entity);
}

function _createPlayerLaser(x, y, playerEntity) {
    let entity = new Entity({key: 'laser'})
    let size = 16;
    entity.addComponent(new PositionComponent(
        {
            width: 3,
            height: 3,
            xPosition: x,
            yPosition: y
        }
    ));
    entity.addComponent(new LightSourceComponent({
        lightType: 'self',
        lightRefresh: 'dynamic',
        angleDegrees: 0,
        maxDistance: 30,
        disableOverride: true,
    }))
    entity.addComponent(new RenderComponent({
        width: 3,
        height: 3,
        shape: 'circle',
        shapeColor: 'rgba(0,255,0,1)',
        renderFromCorner: true
    }))

    entity.addComponent(new AttachedComponent({ attachedToEntity: playerEntity, sync: ['xPosition', 'yPosition', 'angleDegrees'], attachmentOptions: {xPosition: 250, yPosition: 4, angleDegrees: 0}}));
  
    Core.addEntity(entity);
}

function _createRifle(ownerEntity) {
    let entity = new Entity()
    let size = 16;
    entity.addComponent(new PositionComponent(
        {
            width: size,
            height: size,
            xPosition: ownerEntity.getComponent('PositionComponent').xPosition,
            yPosition: ownerEntity.getComponent('PositionComponent').yPosition,
            angleDegrees: 0,
        }
    ));
    entity.addComponent(new RenderComponent({
        width: 14,
        height: 1,
        shape: 'rectangle',
        shapeColor: 'rgb(24, 29, 24)',
        renderLayer: 'CHARACTER_DECOR_LOWER',
    }))
    entity.addComponent(new WeaponComponent({
        weaponKey: 'rifle',
        currentAmmunition: 30
    }));
    entity.addComponent(new AttachedComponent({ attachedToEntity: ownerEntity, sync: ['xPosition', 'yPosition', 'angleDegrees'], attachmentOptions: {xPosition: 5, yPosition: 4, angleDegrees: 0}}));
    Core.addEntity(entity);
}

function _randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}