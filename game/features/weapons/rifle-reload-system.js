import { default as Entity } from '@core/entity.js';
import { default as System } from '@core/system';

import { toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { notYetTime } from '@game/utilities/timing-util.js';

// Used to render the bullet
import VectorComponent from '@game/engine/movement/vector-component';
import PositionComponent from '@game/engine/position/position-component';
import RenderComponent from '@game/engine/renderer/render-component';
import TimerComponent from '@game/engine/timer/timer-component';
import LightSourceComponent from '../../engine/lighting/light-source-component';
export default class RifleReloadSystem extends System {
    constructor() {
      super()


      this.reloading = false;
      this.addHandler('INPUT_RECEIVED', (payload) => {

        if (payload.action == 'reload') {
          this.forTaggedAs('PlayerControllable', (entity, tag) => {
            let position = entity.getComponent('PositionComponent');
            this.reloadWeapon(entity, position.xPosition, position.yPosition, position.angleDegrees);
          })
        }
      })
    }

    reloadWeapon(entity, xPosition, yPosition, angleDegrees) {
      if (this.reloading) {
        return;
      }
      this.reloading = true;

      this._playReloadAudioFx();
      this._playMagazineDisposalFx(xPosition, yPosition, angleDegrees);
      this._performReload(entity)
    }

    work() {
    };

    _performReload(entity) {
      this.workForTag('Weapon', (tag, weaponEntity) => {
        if (tag.belongsToEntity(entity.id)) {
          tag.setCurrentAmmunition(0)
          
          this.forKeyedAs('player-flashlight', (light) => {
            light.getComponent('LightSourceComponent').isOn = false;
          });

          this.forKeyedAs('ui-pc-highlight', (light) => {
            light.getComponent('LightSourceComponent').maxDistance = 0;
          });

          setTimeout(() => {
            if (tag.isInactive()) {
              return;
            }
            tag.setCurrentAmmunition(30)

            this.forKeyedAs('player-flashlight', (light) => {
              light.getComponent('LightSourceComponent').isOn = true;
            });

            this.forKeyedAs('ui-pc-highlight', (light) => {
              // This doesn't belong here.
              const minLight = 8;
              const maxLight = 30;
      
              light.getComponent('LightSourceComponent').maxDistance = 30;
              this.reloading = false;
            });
            
          }, 2000)
        }
      })
    }

    _playReloadAudioFx() {
      this.send('PLAY_AUDIO', {audioKey: 'reload-1.mp3', exclusive: true, exclusiveGroup: 'reload', volume: 1});
    }

    _playMagazineDisposalFx(xPosition, yPosition, angleDegrees) {
        const velocity = 5 + Math.random() * 7;
        const entity = new Entity();
        entity.addComponent(new PositionComponent({
          width: 4,
          height: 10,
          xPosition: xPosition,
          yPosition: yPosition,
          angleDegrees: 0
        }));
    
        entity.addComponent(new RenderComponent({
          width: 4,
          height: 10,
          shape: 'rectangle',
          shapeColor: 'rgba(60, 60, 65, 0.95)',
          angleDegrees: angleDegrees,
          renderLayer: 'LOWER_DECOR'
        }));
    
        const vectorComponent = new VectorComponent({
          bleedAmount: 0.2
        });

        vectorComponent.addVector(velocity, angleDegrees + 90);
        entity.addComponent(vectorComponent);
    
        this._core.addEntity(entity);
    
        this.send("PLAY_AUDIO", {
            audioKey: 'magazine-dispose-1.mp3',
            volume: 1
        })
    }
  }
  