import { default as System } from '@core/system';
import { default as logicConfiguration } from './logic-configuration.js';

export default class LogicConfigurationSystem extends System {
    constructor() {
        super()

        let definedRules = logicConfiguration.rulesByName;
        Object.keys(logicConfiguration.entityRules).forEach((entityType) => {
            let rules = logicConfiguration.entityRules[entityType].rules.map((ruleName) => {
                return definedRules[ruleName]
            })
            this.send('REGISTER_LOGIC_HOOK_FOR_ENTITY_TYPE', {
                type: entityType,
                rules: rules
            });
        });
    }
    
    work() {
    };
  }