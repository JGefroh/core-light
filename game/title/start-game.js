import '@core/component';
import Core from '@core/core';
import '@core/tag';

import '@game/title/font-loader.js';

import { createTestData } from '@game/title/test-data.js';

// General Mechanics
import GuiSystem from '@game/engine/gui/gui-system';
import LightSystem from '@game/engine/lighting/light-system';
import RenderSystem from '@game/engine/renderer/render-system';
import RenderablesRenderSystem from '@game/engine/renderer/renderables-render-system';
import TimerSystem from '@game/engine/timer/timer-system';
import Cursorable from '@game/tracker/cursorable';
import MouseTrackerSystem from '@game/tracker/mouse-tracker-system';

import ParticleSystem from '@game/engine/particle/particle-system';
import AudioSystem from '@game/engine/audio/audio-system';
    import AudioListener from '@game/engine/audio/audio-listener-tag';
import GuiCanvasRenderable from '@game/engine/gui/gui-canvas-renderable-tag';
import InputSystem from '@game/engine/input/input-system';
import ViewportSystem from '@game/engine/renderer/viewport-system';

// Base gameplay systems
import MovementFinalizationSystem from '@game/engine/movement/movement-finalization-system';
import MovementProposalSystem from '@game/engine/movement/movement-proposal-system';

// Game-specific Mechanics
import InputConfigurationSystem from '@game/specifics/configuration/input-configuration-system';

    // Player Control
    import PlayerControlFlashlightSystem from '@game/features/player-control/player-control-flashlight-system';
import PlayerControlMovementSystem from '@game/features/player-control/player-control-movement-system';
import PlayerControlWeaponSystem from '@game/features/player-control/player-control-weapon-system';
import PlayerControllable from '@game/features/player-control/player-controllable-tag';

    // Weapons
    import RifleFiringSystem from '@game/features/weapons/rifle-firing-system';
import WeaponFiringSystem from '@game/features/weapons/weapon-firing-system';
import Weapon from '@game/features/weapons/weapon-tag';

import TurnsTowardsSystem from '@game/features/turn-towards-cursor/turns-towards-system';
import TurnsTowards from '@game/features/turn-towards-cursor/turns-towards-tag';



// Tags
import Lightable from '@game/engine/lighting/lightable-tag';
import Movable from '@game/engine/movement/movement-tags';
import Renderable from '@game/engine/renderer/render-tags';
import Timer from '@game/engine/timer/timer-tag';

//Debug systems
import Collidable from '@game/engine/collision/collidable-tag';
import CollisionSystem from '@game/engine/collision/collision-system';
import Shadowable from '@game/engine/lighting/shadowable-tag';
import ViewportFollowable from '@game/engine/renderer/viewport-followable-tag';
import DebugUiSystem from '@game/specifics/debug/debug-ui-system';
import Attached from '../engine/attachments/attached-tag';
import AttachmentSyncSystem from '../engine/attachments/attachment-sync-system';
import HitscanSystem from '../engine/hitscan/hitscan-system';
import HitscanTarget from '../engine/hitscan/hitscan-target-tag';
import WeaponEffectSystem from '../features/weapons/weapon-effect-system';
import WeaponRecoilSystem from '../features/weapons/weapon-recoil-system';
import CollisionConfigurationSystem from '../specifics/configuration/collision-configuration-system';


import ImpactFxSystem from '@game/features/impact-fx/impact-fx-system';
import FootstepFxSystem from '../features/footstep-fx/footstep-fx-system';
import HasFootsteps from '../features/footstep-fx/has-footsteps-tag';
import ParticleEmitter from '../engine/particle/particle-emitter-tag';
import Material from '../engine/material/material-tag';
import AiSystem from '@game/engine/ai/ai-system';
import Ai from '../engine/ai/ai-tag';
import AiConfigurationSystem from '../specifics/configuration/ai-configuration-system';
import DistanceTrackerSystem from '../engine/tracker/distance-tracker-system';
import DistanceTrack from '../engine/tracker/distance-track-tag';
import PlayerDeathFxSystem from '../features/death-fx/player-death-fx-system';
import EnemyDeathFxSystem from '../features/death-fx/enemy-death-fx-system';
import LaserAimSystem from '../features/laser-aim/laser-aim-system';
import AiStateInformerSystem from '../features/ai/informers/ai-state-informer-system';
import MapGeneratorSystem from '@game/engine/generators/map-generator-system';
import PropGeneratorSystem from '@game/engine/generators/prop-generator-system';
import EnemyGeneratorSystem from '../features/enemy-generator/enemy-generator-system';
import DamageSystem from '../genre/combat/damage-system';
import Damageable from '../genre/combat/damageable-tag';
import RifleReloadSystem from '../features/weapons/rifle-reload-system';
import InstructionSystem from '../features/instructions/instructions-system';
import GameOverSystem from '../features/game-over/game-over-system';
import TextureSystem from '../engine/renderer/texture-system';
import AssetLoaderSystem from '@game/engine/assets/asset-loader-system';
import AssetConfigurationSystem from '../specifics/configuration/assets/asset-configuration-system';
import LogicConfigurationSystem from '../specifics/configuration/logic/logic-configuration-system';
import LogicSystem from '../engine/logic/logic-system';
import HasLogic from '../engine/logic/has-logic';
import TrailSystem from '../features/trail-fx/trail-system';
import TrailZone from '../features/trail-fx/trail-zone-tag';
import TrailEmitter from '../features/trail-fx/trail-emitter-tag';

export function startGame() {

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

    // Camera
    Core.addSystem(new ViewportSystem());
        Core.addTag(ViewportFollowable)

    // Audio
    Core.addSystem(new AudioSystem());
        Core.addTag(AudioListener);

    //Lighting
    Core.addSystem(new LightSystem())
        Core.addTag(Lightable)
        Core.addTag(Shadowable)

    // Input
    Core.addSystem(new InputSystem())
        Core.addSystem(new MouseTrackerSystem());

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
    


    // Ambience
    
    // Utilities
    Core.addSystem(new TimerSystem());
        Core.addTag(Timer);

    // Generic tags
    Core.addTag(Cursorable);


    ////
    // Features
    ////

    //Gameplay
    Core.addSystem(new TurnsTowardsSystem());
        Core.addTag(TurnsTowards);

    // AI and Enemies
    Core.addSystem(new AiSystem());
        Core.addTag(Ai);
    Core.addSystem(new AiStateInformerSystem())
    Core.addSystem(new EnemyGeneratorSystem())

    // Player Control (firing, moving)
    Core.addSystem(new PlayerControlMovementSystem())
        Core.addTag(PlayerControllable);
        Core.addSystem(new PlayerControlWeaponSystem())
        Core.addSystem(new PlayerControlFlashlightSystem());

    // Combat and weapons
    Core.addSystem(new WeaponFiringSystem())
        Core.addSystem(new RifleFiringSystem())
        Core.addSystem(new RifleReloadSystem())
        Core.addSystem(new WeaponRecoilSystem());
        Core.addSystem(new WeaponEffectSystem());
        Core.addTag(Weapon);
    Core.addSystem(new HitscanSystem());
        Core.addTag(HitscanTarget);
    Core.addSystem(new DamageSystem());
        Core.addTag(Damageable);
    Core.addSystem(new LaserAimSystem());

    // FX
    Core.addTag(Material);
    Core.addSystem(new ImpactFxSystem());
    Core.addSystem(new FootstepFxSystem());
        Core.addTag(HasFootsteps);
    Core.addSystem(new PlayerDeathFxSystem());
    Core.addSystem(new EnemyDeathFxSystem());
    Core.addSystem(new TrailSystem());
        Core.addTag(TrailZone);
        Core.addTag(TrailEmitter);

    // Game logic and conditions
    Core.addSystem(new InstructionSystem());
    Core.addSystem(new GameOverSystem());


    ////
    // Game-specific configuration
    ////

    // Game Specific Configuration
    Core.addSystem(new InputConfigurationSystem());
    Core.addSystem(new CollisionConfigurationSystem());
    Core.addSystem(new AiConfigurationSystem())
    Core.addSystem(new LogicConfigurationSystem());
    Core.addSystem(new AssetConfigurationSystem()); // Must go after logic


    //Debug
    Core.addSystem(new DebugUiSystem());


    Core.start();

    setTimeout(() => {
        createTestData();
    }, 500)
} 