import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import LightSourceComponent from '@game/engine/lighting/light-source-component';
import PositionComponent from '@game/engine/position/position-component';
import VectorComponent from '@game/engine/movement/vector-component';
import RenderComponent from '@game/engine/renderer/render-component';

import TimerComponent from '@game/engine/timer/timer-component';
import DistanceTrackerComponent from '../../engine/tracker/distance-tracker-component';


export default class WeaponEffectSystem extends System {
  constructor() {
    super()
    this.timesPerSecond = 1000;
    this.addHandler('WEAPON_EFFECT_REQUESTED', (payload) => {
      this.workForEntityWithTag(payload.entityId, 'Movable', (entity, tag) => {
        this.addPointLightFlash(payload.weaponXPosition, payload.weaponYPosition);
        this.addShellCasing(payload.weaponXPosition, payload.weaponYPosition, tag.getAngleDegrees())
        this.addMuzzleFlash(payload.weaponXPosition, payload.weaponYPosition, tag.getAngleDegrees())
        this.addDust(payload.weaponXPosition, payload.weaponYPosition, tag.getAngleDegrees());

        this.send('HITSCAN_REQUESTED', {
          originX: payload.weaponXPosition,
          originY: payload.weaponYPosition,
          range: payload.range,
          angleDegrees: payload.angleDegrees,
          callback: (result) => {
            this.spawnBullet(payload.entityId, payload.bulletMath, payload.weapon,  payload.weaponXPosition, payload.weaponYPosition, tag.getAngleDegrees(), result.xPosition, result.yPosition)
          }
        });

        this.send("CAMERA_SHAKE")
      })
    });
  }

  addPointLightFlash(x, y) {
    let entity = new Entity()
    let offsets = this.calculateOffset(x, y, 0)
    entity.addComponent(new PositionComponent(
      {
        width: 16,
        height: 16,
        xPosition: offsets.xPosition,
        yPosition: offsets.yPosition,
      }
    ));
    entity.addComponent(new LightSourceComponent({
      lightType: 'point',
      maxDistance: 100,
      lightStyle: 'flicker'
    }))
    entity.addComponent(new TimerComponent({
      time: 5
    }));
    this._core.addEntity(entity);
  }

  addShellCasing(xPosition, yPosition, firingAngleDegrees) {
    const ejectionAngleOffset = 80 + Math.random() * 20; // ~90° to side
    const ejectionAngle = firingAngleDegrees + ejectionAngleOffset;
    const velocity = 2 + Math.random() * 2;
    const size = 2 + Math.random() * 2;
    let offsets = this.calculateOffset(xPosition, yPosition, firingAngleDegrees)

    const entity = new Entity();
    entity.addComponent(new PositionComponent({
      width: size,
      height: size * 0.4,
      xPosition: offsets.xPosition,
      yPosition: offsets.yPosition,
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

    // entity.addComponent(new TimerComponent({
    //   time: 300 + Math.random() * 300 // 300–600 ms
    // }));

    const vectorComponent = new VectorComponent({
      bleedAmount: Math.random() * 0.2
    });
    vectorComponent.addVector(velocity, ejectionAngle);
    entity.addComponent(vectorComponent);

    this._core.addEntity(entity);

    let shellClink = [
        'shell-clink-1.mp3',
        'shell-clink-2.mp3'
    ]

    this.send("PLAY_AUDIO", {
        audioKey: this._getRandomFrom(shellClink),
        sourceXPosition: xPosition, 
        sourceYPosition: yPosition, 
        decibels: 3
    })
  }

  calculateOffset(x, y, angleDegrees) {
    const angleRadians = angleDegrees * (Math.PI / 180);

    const offsetRight = 6;
    const offsetUp = 0;

    const offsetX = offsetRight * Math.cos(angleRadians) - offsetUp * Math.sin(angleRadians);
    const offsetY = offsetRight * Math.sin(angleRadians) + offsetUp * Math.cos(angleRadians);

    const xPosition = x + offsetX;
    const yPosition = y+ offsetY;
    return {xPosition: xPosition, yPosition: yPosition}
  }
  addMuzzleFlash(x, y, angleDegrees) {
    const offsets = this.calculateOffset(x, y, angleDegrees);
    x = offsets.xPosition;
    y = offsets.yPosition;
  
    const basePayload = {
      xPosition: x,
      yPosition: y,
      particleEmitFrequencyInMs: 0,
      particleEmissionCyclesMax: 1,
      particleShape: 'circle'
    };
  
    // Outer flash glow ring (slightly delayed, larger)
    this._core.send('EMIT_PARTICLES', {
      ...basePayload,
      particleCount: 3,
      particleLifetimeMin: 30,
      particleLifetimeMax: 60,
      particleHeightMin: 10,
      particleHeightMax: 14,
      particleWidthMin: 10,
      particleWidthMax: 14,
      particleColors: ['#ffddaa', '#ffaa33'],
      particleSpeedMin: 0,
      particleSpeedMax: 5,
      particleEmissionAngleDegreesMin: angleDegrees - 5,
      particleEmissionAngleDegreesMax: angleDegrees + 5
    });
  
    // Shockwave ring (fast radial burst, low opacity)
    this._core.send('EMIT_PARTICLES', {
      ...basePayload,
      particleCount: 8,
      particleLifetimeMin: 60,
      particleLifetimeMax: 90,
      particleHeightMin: 1,
      particleHeightMax: 2,
      particleWidthMin: 8,
      particleWidthMax: 12,
      particleColors: ['#ffffff88'], // translucent white
      particleSpeedMin: 50,
      particleSpeedMax: 80,
      particleEmissionAngleDegreesMin: angleDegrees - 180,
      particleEmissionAngleDegreesMax: angleDegrees + 180
    });
  
    // Sparks (forward-biased directional energy burst)
    this._core.send('EMIT_PARTICLES', {
      ...basePayload,
      particleCount: 12,
      particleLifetimeMin: 120,
      particleLifetimeMax: 180,
      particleHeightMin: 0.5,
      particleHeightMax: 1.5,
      particleWidthMin: 0.5,
      particleWidthMax: 1.5,
      particleColors: ['#ffaa00', '#ffcc33', '#ff9900'],
      particleSpeedMin: 120,
      particleSpeedMax: 180,
      particleEmissionAngleDegreesMin: angleDegrees - 10,
      particleEmissionAngleDegreesMax: angleDegrees + 30  // slightly forward-weighted
    });
  
    // Smoke puff (builds after flash)
    this._core.send('EMIT_PARTICLES', {
      ...basePayload,
      particleCount: 10,
      particleLifetimeMin: 400,
      particleLifetimeMax: 700,
      particleHeightMin: 2,
      particleHeightMax: 6,
      particleWidthMin: 2,
      particleWidthMax: 6,
      particleColors: ['#666666', '#888888', '#444444'],
      particleSpeedMin: 5,
      particleSpeedMax: 10,
      particleEmissionAngleDegreesMin: angleDegrees - 15,
      particleEmissionAngleDegreesMax: angleDegrees + 15
    });
  }

  spawnBullet(firingEntityId, bulletMath, weapon, xPosition, yPosition, firingAngleDegrees, targetX, targetY) {
    let entity = new Entity();
    let vector = new VectorComponent();
    let firingEntity = this._core.getEntityWithId(firingEntityId)
    let dx = targetX - xPosition;
    let dy = targetY - yPosition;
    let rangeToTarget = Math.sqrt(dx * dx + dy * dy);
    let bulletSpeed = bulletMath.magnitude + Math.random() * 300

    if (firingEntity.getComponent('VectorComponent')) {
        // Add the movement of the firing entity to the bullet to ensure proper relative speeds.
        let firingEntityVector = firingEntity.getComponent('VectorComponent').calculateTotalVector();
        vector.addVector(firingEntityVector.magnitude, firingEntityVector.angleDegrees)
    }

    vector.addVector(bulletSpeed, firingAngleDegrees)

    entity.addComponent(new RenderComponent({ 
        width: weapon.bulletWidth, 
        height: weapon.bulletHeight, 
        shape: 'rectangle',
        shapeColor: '#FFB200',
        angleDegrees: firingAngleDegrees,
        renderFromCorner: true
    }))

    entity.addComponent(new LightSourceComponent({
      lightType: 'self'
    }));
    entity.addComponent(new PositionComponent({ xPosition: xPosition, yPosition: yPosition, width: weapon.bulletWidth, height: weapon.bulletHeight, angleDegrees: firingAngleDegrees}));
    let time = (rangeToTarget / (bulletSpeed))
    entity.addComponent(new DistanceTrackerComponent({
      totalDistanceMax: rangeToTarget,
      onMaxExceeded: () => {
        this._core.removeEntity(entity);
      }
    }))
    entity.addComponent(vector);

    this._core.addEntity(entity);
  }

  _getRandomFrom(collection) {
    return collection[Math.floor(Math.random() * collection.length)]
  }

  addDust(x, y, angleDegrees) {
    this._core.send('REQUEST_DUST_FX', { xPosition: x, yPosition: y})
  }
}
