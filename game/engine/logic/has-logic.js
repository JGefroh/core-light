import { default as Tag } from '@core/tag';

export default class HasLogic extends Tag {
    static tagType = 'HasLogic';

    constructor() {
        super();
        this.tagType = 'HasLogic';
    }

    static isAssignableTo(entity) {
        return entity.hasComponent('LogicComponent')
    }

    getRules() {
        return this.entity.getComponent('LogicComponent').rules;
    }

    deactivateRule(rule) {
        rule.status = 'inactive'
    }
} 