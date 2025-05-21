import { default as System } from '@core/system';

import AiComponent from '@game/engine/ai/ai-component';
import { GoalAttack } from '../goals/goal-attack';
import { TacticAttack } from '../tactics/tactic-attack';
import { ActionMoveTowardsTarget } from '../actions/action-move-towards-target';
import { StepTurnTowardsTarget } from '../steps/step-turn-towards-target';

export default class AiStateInformerSystem extends System {
    constructor() {
      super();
      this.send('REGISTER_STATE_INFORMER', {
        key: "AI_STATE_INFORMER",
        inform: this._inform.bind(this)
      });
    }
    
    work() {
    }

    _inform() {
      return {
        playerLocation: this._getPlayerLocations()[0],
        playerAimLocation: this._getPlayerAimLocation()
      }
    }

    _getPlayerLocations() {
      let results = [];
      this.workForTag('PlayerControllable', (tag) => {
        let controllable = tag.getEntity();
        let positionComponent = controllable.getComponent('PositionComponent');

        results.push({
          xPosition: positionComponent?.xPosition,
          yPosition: positionComponent?.yPosition,
          angleDegrees: positionComponent?.angleDegrees,
          entityId: controllable?.id
        })
      });
      return results;
    }

    _getPlayerAimLocation() {
      let entity = this._core.getEntityWithKey('laser');

      return {
        xPosition: entity?.getComponent('PositionComponent')?.xPosition,
        yPosition: entity?.getComponent('PositionComponent')?.yPosition
      }
    }
  }
  