export class GoalAttack {
    constructor(configuration) {
        this.configuration = configuration
        this.tacticOptions = [
            {key: 'tactic_attack', configuration: configuration}
        ]
    }

    getTacticOptions() {
        return this.tacticOptions;
    }
}