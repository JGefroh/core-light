export class TacticAttack {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.actionOptions = [
            {key: 'action_move_towards_target'},
        ]
    }

    getActionOptions() {
        return this.actionOptions;
    }
}