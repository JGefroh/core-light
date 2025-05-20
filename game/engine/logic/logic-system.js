import { default as System } from '@core/system';
import LogicComponent from './logic-component';

/**
 * 
 * Condition: {type: 'condition_type', params: {}}
 * 
 */
export default class LogicSystem extends System {
    constructor(config = {}) {
      super()

      this.conditionEvaluators = {};
      this.autoApplyTo = {};

      this.addHandler('REGISTER_LOGIC_HOOK_FOR_ENTITY_TYPE', (payload) => {
        this.autoApplyTo[payload.type] = payload.rules;
      })

      this.addHandler('CORE_ENTITY_CREATED', (payload) => {
        let rules = this.autoApplyTo[payload.entity.getType()];
        if (rules) {
            payload.entity.addComponent(new LogicComponent({rules: rules}));
        }
      });
    }
  
    work() {
        this.workForTag('HasLogic', (tag) => {
            let rules = tag.getRules();
            rules.forEach((rule) => {
                if (this._checkRuleConditions(rule)) {
                    this._executeEffect(rule);
                }
            });
        });
    };

    _checkRuleConditions(rule) {
        let conditions = rule.conditions;
        let allTrue = true;
        conditions.forEach((condition) => {
            let evaluator = this.conditionEvaluators[condition.type];
            if (!evaluator) {
                console.error("LogicSystem | Unknown condition evaluator: ${condition.type}");
                return;
            }

            allTrue = allTrue && evaluator.evaluate(params);
        });

        return allTrue;
    }

    _executeEffect(rule) {
        rule.effects.forEach((effect) => {
            this.send(effect.type, effect.params);
        });
    }
}