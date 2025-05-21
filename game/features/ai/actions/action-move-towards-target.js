import { ActionBase } from '@game/engine/ai/actions/action-base';
import { calculateDistanceBetweenPositions } from '@game/engine/position/distance.js';

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
        let globalState = currentState.globalCurrentState.AI_STATE_INFORMER;
        

        if (!globalState || !globalState.playerLocation) {
            return;
        }

        let entity = currentState.entity;
        if (!entity?.id) {
            return 0;
        }

        let movable = core.getTag('Movable');
        if (!movable.constructor.isAssignableTo(entity)) {
            return;
        }
        movable.setEntity(entity);


        let distance = calculateDistanceBetweenPositions(movable.getXPosition(), movable.getYPosition(), globalState.playerLocation.xPosition, globalState.playerLocation.yPosition);
        if (distance < 400) {
            return 100;
        }

        return 0;

    }
}