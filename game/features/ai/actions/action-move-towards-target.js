import { distanceFromTo, distanceBetween, angleTo, toCoordinateUnitsFromMeters } from '@game/utilities/distance-util';
import { ActionBase } from '@game/engine/ai/actions/action-base';

export class ActionMoveTowardsTarget extends ActionBase {
    constructor(configuration) {
        super(configuration)
        this.score = 0;
        this.key = 'action_move_towards_target'
        this.cooldown = 0;
        this.stepOptions = [
            { key: 'step_turn_towards_target' },
            { key: 'step_move_towards_target' }
        ]
    }

    beforeActionRun(currentState, core) {
    }

    calculateScore(currentState, core) {
        this.score = 100
    }
}