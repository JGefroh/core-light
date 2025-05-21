import Core from '@core/core';
import { startGame } from '@game/title/start-game';
import { default as Entity } from '@core/entity.js';
import '@core/tag';


// General Mechanics
import GuiSystem from '@game/engine/gui/gui-system';
import LightSystem from '@game/engine/lighting/light-system';
import RenderSystem from '@game/engine/renderer/render-system';
import RenderablesRenderSystem from '@game/engine/renderer/renderables-render-system';
import TimerSystem from '@game/engine/timer/timer-system';
import AudioListener from '@game/engine/audio/audio-listener-tag';
import AudioSystem from '@game/engine/audio/audio-system';
import GuiCanvasRenderable from '@game/engine/gui/gui-canvas-renderable-tag';
import ParticleSystem from '@game/engine/particle/particle-system';
import MovementFinalizationSystem from '@game/engine/movement/movement-finalization-system';
import MovementProposalSystem from '@game/engine/movement/movement-proposal-system';
import Lightable from '@game/engine/lighting/lightable-tag';
import Movable from '@game/engine/movement/movement-tags';
import Renderable from '@game/engine/renderer/render-tags';
import Timer from '@game/engine/timer/timer-tag';
import Collidable from '@game/engine/collision/collidable-tag';
import CollisionSystem from '@game/engine/collision/collision-system';
import Shadowable from '@game/engine/lighting/shadowable-tag';
import Attached from '../engine/attachments/attached-tag';
import AttachmentSyncSystem from '../engine/attachments/attachment-sync-system';
import HitscanSystem from '../engine/hitscan/hitscan-system';
import HitscanTarget from '../engine/hitscan/hitscan-target-tag';
import CollisionConfigurationSystem from '../specifics/configuration/collision-configuration-system';
import AiSystem from '@game/engine/ai/ai-system';
import AssetLoaderSystem from '@game/engine/assets/asset-loader-system';
import MapGeneratorSystem from '@game/engine/generators/map-generator-system';
import PropGeneratorSystem from '@game/engine/generators/prop-generator-system';
import ImpactFxSystem from '@game/features/impact-fx/impact-fx-system';
import Ai from '../engine/ai/ai-tag';
import HasLogic from '../engine/logic/has-logic';
import LogicSystem from '../engine/logic/logic-system';
import Material from '../engine/material/material-tag';
import ParticleEmitter from '../engine/particle/particle-emitter-tag';
import TextureSystem from '../engine/renderer/texture-system';
import DistanceTrack from '../engine/tracker/distance-track-tag';
import DistanceTrackerSystem from '../engine/tracker/distance-tracker-system';
import AiStateInformerSystem from '../features/ai/informers/ai-state-informer-system';
import EnemyDeathFxSystem from '../features/death-fx/enemy-death-fx-system';
import EnemyGeneratorSystem from '../features/enemy-generator/enemy-generator-system';
import FootstepFxSystem from '../features/footstep-fx/footstep-fx-system';
import HasFootsteps from '../features/footstep-fx/has-footsteps-tag';
import TrailEmitter from '../features/trail-fx/trail-emitter-tag';
import TrailSystem from '../features/trail-fx/trail-system';
import TrailZone from '../features/trail-fx/trail-zone-tag';
import DamageSystem from '../genre/combat/damage-system';
import Damageable from '../genre/combat/damageable-tag';
import AiConfigurationSystem from '../specifics/configuration/ai-configuration-system';
import AssetConfigurationSystem from '../specifics/configuration/assets/asset-configuration-system';
import LogicConfigurationSystem from '../specifics/configuration/logic/logic-configuration-system';



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

let stopTitle = false;
function addSystems() {

    ////
    // Generic systems
    ////
    // Rendering
    Core.addSystem(new RenderSystem())
        Core.addTag(Renderable)
        Core.addSystem(new RenderablesRenderSystem())
        Core.addSystem(new TextureSystem());


    // GUI
    Core.addSystem(new GuiSystem())
        Core.addTag(GuiCanvasRenderable)

    // Loaders and Gnerators
    Core.addSystem(new AssetLoaderSystem());
        Core.addSystem(new PropGeneratorSystem());
        Core.addSystem(new MapGeneratorSystem());

    // Audio
    Core.addSystem(new AudioSystem());
        Core.addTag(AudioListener);

    //Lighting
    Core.addSystem(new LightSystem())
        Core.addTag(Lightable)
        Core.addTag(Shadowable)

    // Per-entity logic
    Core.addSystem(new LogicSystem());
        Core.addTag(HasLogic)

    // Extras
    Core.addSystem(new ParticleSystem());
        Core.addTag(ParticleEmitter);
    
    // Movement and attached object syncing [ordering matters here]
    Core.addSystem(new MovementProposalSystem());
        Core.addTag(Movable);
        Core.addSystem(new DistanceTrackerSystem());
            Core.addTag(DistanceTrack);
        Core.addSystem(new CollisionSystem());
            Core.addTag(Collidable);
    Core.addSystem(new MovementFinalizationSystem());
    Core.addSystem(new AttachmentSyncSystem())
        Core.addTag(Attached)
    
    // Utilities
    Core.addSystem(new TimerSystem());
        Core.addTag(Timer);


    ////
    // Features
    ////
    Core.addTag(Material);
    Core.addSystem(new ImpactFxSystem());
    Core.addSystem(new FootstepFxSystem());
        Core.addTag(HasFootsteps);
    Core.addSystem(new EnemyDeathFxSystem());
    Core.addSystem(new TrailSystem());
        Core.addTag(TrailZone);
        Core.addTag(TrailEmitter);


    // Game logic and conditions

    ////
    // Game-specific configuration
    ////

    // Game Specific Configuration
    Core.addSystem(new CollisionConfigurationSystem());
    Core.addSystem(new LogicConfigurationSystem());
    Core.addSystem(new AssetConfigurationSystem({skipMapLoad: true})); // Must go after logic


    Core.start();
}

function addEntities() {
    addFloor();
    addFlashlight();
    addBlood();
    addFootsteps();
    addShellCasings();
    addDebris();
    addShelf();
}

function resetSystems() {
    Core.clear();
    window.onkeydown = null;
    window.onclick = null;
}

function addHandler() {
    window.onclick = function(event) {
        window.onclick = null;
        Core.addSystem(new AudioSystem())
        playSounds(true);
    }

    window.onkeydown = function(event) {
        stopTitle = true;
        event.stopPropagation();
        event.preventDefault();
        resetSystems();
        startGame();
    };
}

function addFloor() {
    let x = 0
    let y = 0
    let width = window.innerWidth * 2;
    let height = window.innerHeight * 2;
    let color = '#273746';
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
    Core.addEntity(entity);
}

function addFlashlight() {
    let entity = new Entity({key: 'player-flashlight'})
    let size = 16;
    let titleOffsetY = -100;
    let x = 250;
    let y = window.innerHeight / 2 + 40 + titleOffsetY;
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
        maxDistance: window.innerWidth - 100,
        coneDegrees: 45,
        lightRefresh: 'dynamic',
        lightStyle: 'flicker'
    }))
    Core.addEntity(entity);
}

function addBlood() {
    let x = window.innerWidth ;
    let y = window.innerHeight / 2 - 75;
    Core.send('CREATE_PROP', {type: 'BLOOD_POOL_1',  xPosition: x, yPosition: y, width: 300, height: 300, angleDegrees: 'random'});
}

function addFootsteps() {
    let x = window.innerWidth;
    let y = window.innerHeight / 2 + - 75;
    const footprints = [];
    for (let i = 0; i < 17; i++) {
        const isLeft = i % 2 !== 0;
        const type = isLeft ? 'BLOODY_BOOTPRINT_LEFT' : 'BLOODY_BOOTPRINT_RIGHT';
        const xOffset = i * -100;
        const wave = Math.sin(i / 2) * 50; // wave-like vertical movement
        const jitter = Math.random() * 20 - 10; // small randomness
        const yOffset = isLeft ? wave + jitter + 50 : wave + jitter;
    
        footprints.push({
            type,
            xPosition: x + xOffset,
            yPosition: y + yOffset,
            width: 16,
            height: 64,
            angleDegrees: -90 + Math.random() * 10 - 5 // slight angle variation
        });
    }
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 200, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 300, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 400, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 500, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 600, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 700, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 800, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 900, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 1000, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 1100, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 1200, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 1300, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 1400, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 1500, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_RIGHT', xPosition: x - 1600, yPosition: y, width: 16, height: 64, angleDegrees: -90},
    // {type: 'BLOODY_BOOTPRINT_LEFT', xPosition: x - 1700, yPosition: (y + 40) * Math.random(), width: 16, height: 64, angleDegrees: -90}

    footprints.forEach((entity) => {
        Core.send('CREATE_PROP', entity)
    })
}

function addShellCasings() {
    for (let i = 0; i < 20; i++) {
        addShellCasing(Math.random() * window.innerWidth, Math.random() * window.innerHeight, Math.random() * 360)
    }
}

function addShellCasing(xPosition, yPosition, firingAngleDegrees) {
    const ejectionAngleOffset = 80 + Math.random() * 20; // ~90° to side
    const ejectionAngle = firingAngleDegrees + ejectionAngleOffset;
    const velocity = 2 + Math.random() * 2;
    const size = 10 + Math.random() * 2;

    const entity = new Entity();
    entity.addComponent(new PositionComponent({
      width: size,
      height: size * 0.4,
      xPosition: xPosition,
      yPosition: yPosition,
      angleDegrees: Math.random() * 360 // for spinning casing look
    }));

    entity.addComponent(new RenderComponent({
      width: size,
      height: size * 0.4,
      shape: 'rectangle',
      shapeColor: '#E0C36E', // brass-like color
      angleDegrees: Math.random() * 360,
      renderLayer: 'LOWER_DECOR'
    }));

    const vectorComponent = new VectorComponent({
      bleedAmount: Math.random() * 0.2
    });
    vectorComponent.addVector(velocity, ejectionAngle);
    entity.addComponent(vectorComponent);

    Core.addEntity(entity);
  }

  function addDebris() {
    for (let i = 0; i < 20; i++) {
        addDebrisRocks(Math.random() * window.innerWidth, Math.random() * window.innerHeight)
    }
  }

  function addDebrisRocks(xPosition, yPosition) {
    let randomMagnitude = Math.random() * 5
    let randomAngle = Math.random() * 360
    let size = Math.random() * 4;
    let color = '#808080';

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
    let vectorComponent = new VectorComponent({
        bleedAmount: Math.random() * 0.20
    });
    vectorComponent.addVector(randomMagnitude, randomAngle);
    entity.addComponent(vectorComponent)

    Core.addEntity(entity);
}

function playSounds() {
    let zombieMoans = [
        'zombie-moan-1.mp3',
        'zombie-moan-2.mp3',
        'zombie-moan-3.mp3',
        'zombie-moan-4.mp3',
        'zombie-moan-5.mp3',
        'zombie-moan-6.mp3',
        'zombie-moan-7.mp3',
    ]

    Core.send("PLAY_AUDIO", {
        audioKey: _randomFrom(zombieMoans),
        volume: 0.5 
    });
    let interval = setInterval(() => {
        if (stopTitle) {
            clearInterval(interval);
            return;
        }
        if (Math.random() <= 0.02) {
            Core.send("PLAY_AUDIO", {
                audioKey: _randomFrom(zombieMoans),
                volume: 0.5 
            });
        }
    }, 1000);
    
}

function addShelf() {
    let x = window.innerWidth;
    let y = window.innerHeight;
    Core.send('CREATE_PROP', {type: 'METAL_SHELF_FRONT', xPosition: x - 100, yPosition: y / 4, width: 320, height: 320, collision: 'wall', angleDegrees: 40});
    Core.send('CREATE_PROP', {type: 'CARDBOARD_BOX_RANDOM', xPosition: x * Math.random(), yPosition: y * Math.random(), width: 60, height: 60, collision: 'wall', angleDegrees: 'random'});
    Core.send('CREATE_PROP', {type: 'CARDBOARD_BOX_RANDOM', xPosition: x * Math.random(), yPosition: y * Math.random(), width: 60, height: 60, collision: 'wall', angleDegrees: 'random'});
    Core.send('CREATE_PROP', {type: 'CARDBOARD_BOX_RANDOM', xPosition: x * Math.random(), yPosition: y * Math.random(), width: 60, height: 60, collision: 'wall', angleDegrees: 'random'});
}

function _randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}


////
//
////
function addTitle() {
    let titleOffsetY = -100;
    let y = window.innerHeight / 2 + titleOffsetY;
    
    Core.send('ADD_GUI_RENDERABLE', {
      key: `title-card-1`,
      xPosition: 40,
      yPosition: y,
      text: 'Light', 
      fontSize: 75,
    });
  
    Core.send('ADD_GUI_RENDERABLE', {
      key: `title-card-3`,
      xPosition: 46,
      yPosition: y + 80,
      text: 'by Joseph Gefroh',
      fontSize: 22,
    });

    Core.send('ADD_GUI_RENDERABLE', {
        key: `title-card-3`,
        xPosition: 46,
        yPosition: window.innerHeight - 40,
        text: 'github.com/jgefroh/core-light',
        fontSize: 14,
      });
  
  
    Core.send('ADD_GUI_RENDERABLE', {
      key: `title-card-2`,
      xPosition: 46,
      yPosition: y + 180,
      text: 'Press any key to start',
      fontSize: 22,
    });
  }
  


setTimeout(() => {
    if (window.location.href.includes('skiptitle')) {
        startGame()
    }
    else {
        addSystems();
        addTitle();
        addEntities();
        addHandler();
    }
}, 100)
