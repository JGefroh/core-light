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
import Animatable from '@game/engine/renderer/animatable-tag';
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
import AiConfigurationSystem from '../features/ai/ai-configuration-system';
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
import AssetLoaderSystem from '@game/specifics/configuration/assets/asset-loader-system';

export function startGame() {

    // General mechanics systems
    Core.addSystem(new RenderSystem())
        Core.addSystem(new RenderablesRenderSystem())
        Core.addSystem(new TextureSystem());
    Core.addSystem(new ParticleSystem());
        Core.addTag(ParticleEmitter);
    Core.addSystem(new ViewportSystem());
    if (window.location.href.indexOf('nolight') == -1) {
        Core.addSystem(new LightSystem())
    }
    Core.addSystem(new GuiSystem())
    Core.addSystem(new InputSystem())
    Core.addSystem(new AudioSystem());
        Core.addTag(AudioListener);
    Core.addSystem(new MouseTrackerSystem());
    Core.addSystem(new TimerSystem());

    // Movement
    Core.addSystem(new MovementProposalSystem());
    Core.addSystem(new DistanceTrackerSystem());
        Core.addTag(DistanceTrack);
    Core.addSystem(new CollisionSystem());
        Core.addSystem(new CollisionConfigurationSystem());
        Core.addTag(Collidable);
    Core.addSystem(new MovementFinalizationSystem());
    Core.addSystem(new AttachmentSyncSystem())
    

    //Debug
    if (window.location.href.indexOf('debug') != -1) {
        Core.addSystem(new DebugUiSystem());

    }


    //Gameplay
    Core.addSystem(new InputConfigurationSystem())
    Core.addSystem(new TurnsTowardsSystem());

    // Ambience


    // Generic tags
    Core.addTag(Renderable)
    Core.addTag(GuiCanvasRenderable)
    Core.addTag(Animatable)
    Core.addTag(Lightable)
    Core.addTag(Shadowable)
    Core.addTag(Timer);
    Core.addTag(Movable);
    Core.addTag(Cursorable);
    Core.addTag(Attached)
    Core.addTag(ViewportFollowable)

    // Specific game tags
    Core.addTag(TurnsTowards);

    Core.addSystem(new AiSystem());
        Core.addTag(Ai);
    Core.addSystem(new AiConfigurationSystem())
    Core.addSystem(new AiStateInformerSystem())


    // Player Control (firing, moving)
    Core.addSystem(new PlayerControlMovementSystem())
        Core.addTag(PlayerControllable);
        Core.addSystem(new PlayerControlWeaponSystem())
        Core.addSystem(new PlayerControlFlashlightSystem());

    // Weeapons
    Core.addSystem(new WeaponFiringSystem())
        Core.addSystem(new RifleFiringSystem())
        Core.addSystem(new RifleReloadSystem())
        Core.addSystem(new WeaponRecoilSystem());
        Core.addSystem(new WeaponEffectSystem());
        Core.addTag(Weapon);
    Core.addSystem(new HitscanSystem());
        Core.addTag(HitscanTarget);


    Core.addSystem(new ImpactFxSystem());
    Core.addSystem(new FootstepFxSystem());
    Core.addTag(HasFootsteps);
    Core.addTag(Material);

    Core.addSystem(new PlayerDeathFxSystem());
    Core.addSystem(new EnemyDeathFxSystem());
    Core.addSystem(new LaserAimSystem());

    // Assets
    Core.addSystem(new EnemyGeneratorSystem())
    Core.addSystem(new PropGeneratorSystem());
    Core.addSystem(new MapGeneratorSystem())
    Core.addSystem(new AssetLoaderSystem());

    Core.addSystem(new DamageSystem());
        Core.addTag(Damageable);
    Core.addSystem(new InstructionSystem());
    Core.addSystem(new GameOverSystem());


    Core.start();

    setTimeout(() => {
        createTestData();
    }, 500)
} 