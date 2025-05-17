export class TacticBase {
    constructor(configuration = {}) {
        this.configuration = configuration;
        this.actionOptions = [
        ]
    }

    getActionOptions() {
        return this.actionOptions;
    }
}