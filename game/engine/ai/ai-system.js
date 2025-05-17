import { default as System } from '@core/system';

import AiComponent from '@game/engine/ai/ai-component';

export default class AiSystem extends System {
    constructor() {
      super();

      this.goals = {
      }

      this.tactics = {
      }

      this.actions = {
      }

      this.steps = {
      }

      this.stateInformers = {}
      this.globalCurrentState = {};

      this.addHandler('SET_AI', (payload) => {
        let entity = this._core.getEntityWithId(payload.entityId)
      })

      this.addHandler('REGISTER_STATE_INFORMER', (payload) => {
        this.stateInformers[payload.key] = payload.inform;
      });

      this.addHandler('REGISTER_GOAL', (payload) => {
        this.goals[payload.key] = payload.class
      })

      this.addHandler('REGISTER_TACTIC', (payload) => {
        this.tactics[payload.key] = payload.class
      })

      this.addHandler('REGISTER_ACTION', (payload) => {
        this.actions[payload.key] = payload.class
      })

      this.addHandler('REGISTER_STEP', (payload) => {
        this.steps[payload.key] = payload.class
      })
    }
    
    work() {
      if (this.goals == {} || this.tactics == {} || this.actions == {} || this.steps == {}) {
        return;
      }
      this.informCurrentState(this.globalCurrentState);

      this.workForTag('Ai', (tag, entity) => {
        let currentState = tag.getCurrentState();
        currentState.entityId = entity.id
        currentState.entity = entity;
        currentState.globalCurrentState = this.globalCurrentState;

        let goal = this.identifyGoal(tag, entity);
        tag.setGoal(goal);
        let tactic = this.identifyTactic(goal);
        tag.setTactic(tactic);
        let action = this.identifyAction(tactic, currentState, tag)
        tag.setAction(action)
        
        if (!action) {
          return;
        }

        let steps = this.getStepsToExecute(action, currentState, tag);
        if (steps?.length) {
          this.executeSteps(steps, currentState);
        }

        tag.setCurrentState(currentState)
      });
    };

    informCurrentState(currentState) {
      Object.keys(this.stateInformers).forEach((key) => {
        let stateInformFunction = this.stateInformers[key]
        let result = stateInformFunction();
        currentState[key] = result
      })
    }

    identifyGoal(tag, entity) {
      return new this.goals[Object.keys(this.goals)[0]]
    }

    identifyTactic(goal) {
      let tacticOptions = goal.getTacticOptions();
      let selection = 0
      return new this.tactics[tacticOptions[selection].key](tacticOptions[selection].configuration)
    }

    identifyAction(tactic, currentState, tag) {
      let actionOptions = tactic.getActionOptions();
      let actionObjects = []
      actionOptions.forEach((actionOption) => {
        actionObjects.push(new (this.actions[actionOption.key])(actionOption.configuration))
      })

      let highestActions = [];
      actionObjects.forEach((actionObject) => {
        let action = actionObject;
        let key = actionObject.key;
        action.calculate(currentState, tag.getActionLastRan(key), this._core);

        if (!action.getScore()) {
          return;
        }
        if (!highestActions.length) {
          highestActions.push(action);
        }
        else if (highestActions[0].getScore() == action.getScore()) {
          highestActions.push(action)
        }
        else if (highestActions[0].getScore() < action.getScore()) {
          highestActions = [action]
        }
      });

      if (tag.getAction() && !tag.getAction()?.isCompleted()) {
        let highestAction = highestActions[0]
        if (highestAction && highestAction.key == tag.getAction().key) {
          return tag.getAction()
        }
      }

      return highestActions[0];
    }

    getStepsToExecute(action, currentState, tag) {
      let stepOptions = []
      let stepObjects = null;
      

      if (action.getCurrentStepIndex() == null) {
        action.prepareAction(currentState, this._core)
        let stepOptions = action.getStepOptions();
        let stepObjects = stepOptions.map((stepOption) => { return new this.steps[stepOption.key](this._core, currentState, stepOption.configuration) });
        action.setSteps(stepObjects);
        action.setCurrentStepIndex(0)
      }

      stepObjects = action.getSteps()

      let stepsToRun = []
      stepObjects.forEach((stepObject, index) => {
        if (stepObject.alwaysRun()) {
          stepsToRun.push(stepObject);
        }
        else if (stepObject.alwaysRunUntilComplete() && !stepObject.isCompleted()) {
          stepsToRun.push(stepObject);
        }
        else if (index == action.getCurrentStepIndex()) {
          if (stepObject.isCompleted()) {
            action.setCurrentStepIndex(action.getCurrentStepIndex() + 1);
          }
          else {
            stepsToRun.push(stepObject);
          }
        }
      });

      if (!stepObjects.length || stepObjects.every((stepObject) => { return stepObject.isCompleted() })) {
        action.markCompleted(currentState)
        tag.setActionLastRan(action.key)
        return null;
      }

      action.beforeActionRun(currentState, this._core)

      return stepsToRun
    }

    executeSteps(stepsToExecute, currentState) {
      let payload = {}
      stepsToExecute.forEach((stepToExecute) => {
        if (stepToExecute.isNotStarted()) {
          stepToExecute.setState('in_progress');
          stepToExecute.executeStep(currentState);
        } else if (stepToExecute.isInProgress() && stepToExecute.checkCompleted(currentState)) {
            stepToExecute.setState('completed');
            if (stepToExecute.alwaysRun()) {
              stepToExecute.executeStep(currentState);
            }
        } else if (stepToExecute.isInProgress()) {
            stepToExecute.executeStep(currentState);
        }
      });
    }

    deleteKeysNotInObject(obj1, obj2) {
      for (let key in obj1) {
          if (!obj2.hasOwnProperty(key)) {
              delete obj1[key];
          }
      }
    }
  }
  