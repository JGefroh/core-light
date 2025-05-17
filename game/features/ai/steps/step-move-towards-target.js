import { StepBase } from '@game/engine/ai/steps/step-base';
import { distanceFromTo } from '@game/utilities/distance-util';

export class StepMoveTowardsTarget extends StepBase {
    constructor(core, currentState, configuration) {
        super(configuration)
        this._core = core;
    }

    execute(currentState) {
        const entity = currentState.entity;
        const vector = entity.getComponent('VectorComponent');
        const position = entity.getComponent('PositionComponent');
        vector.addVector(Math.random(), position.angleDegrees)
    }

    meetsPreconditions() {
        return true;
    }

    checkCompleted(currentState) {
        return true;
    }
}