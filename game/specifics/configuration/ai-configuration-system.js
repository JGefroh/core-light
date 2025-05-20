import { default as System } from '@core/system';

import AiComponent from '@game/engine/ai/ai-component';
import { GoalAttack } from '../../features/ai/goals/goal-attack';
import { TacticAttack } from '../../features/ai/tactics/tactic-attack';
import { ActionMoveTowardsTarget } from '../../features/ai/actions/action-move-towards-target';
import { StepTurnTowardsTarget } from '../../features/ai/steps/step-turn-towards-target';
import { StepMoveTowardsTarget } from '../../features/ai/steps/step-move-towards-target';

export default class AiConfigurationSystem extends System {
    constructor() {
      super();

      this.goals = {
        'goal_attack': GoalAttack
      }

      this.tactics = {
        'tactic_attack': TacticAttack
      }

      this.actions = {
        'action_move_towards_target': ActionMoveTowardsTarget
      }

      this.steps = {
        'step_turn_towards_target': StepTurnTowardsTarget,
        'step_move_towards_target': StepMoveTowardsTarget
      }

      Object.keys(this.goals).forEach((key) => {
        this.send('REGISTER_GOAL', {key: key, class: this.goals[key]})
      })

      Object.keys(this.tactics).forEach((key) => {
        this.send('REGISTER_TACTIC', {key: key, class: this.tactics[key]})
      })

      Object.keys(this.actions).forEach((key) => {
        this.send('REGISTER_ACTION', {key: key, class: this.actions[key]})
      })

      Object.keys(this.steps).forEach((key) => {
        this.send('REGISTER_STEP', {key: key, class: this.steps[key]})
      })
    }
    
    work() {
    }
  }
  