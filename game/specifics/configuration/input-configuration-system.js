import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class InputConfigurationSystem extends System {
    constructor() {
        super()
        this.keyMap = {
            // Movement controls
            'w_press': 'move_up',
            'w_hold': 'move_up',
            'a_press': 'move_left',
            'a_hold': 'move_left',
            'd_press': 'move_right',
            'd_hold': 'move_right',
            's_press': 'move_down',
            's_hold': 'move_down',
            'r_release': 'reload',


            'ArrowUp_press': 'move_up',
            'ArrowUp_hold': 'move_up',
            'ArrowLeft_press': 'move_left',
            'ArrowLeft_hold': 'move_left',
            'ArrowRight_press': 'move_right',
            'ArrowRight_hold': 'move_right',
            'ArrowDown_press': 'move_down',
            'ArrowDown_hold': 'move_down',

            // Personal interaction controls
            'f_press': 'flashlight_off', // Need the press to avoid the press delay
            'f_hold': 'flashlight_off',
            't_release': 'flashlight_mode_toggle',
            'click_once': 'attack_1',

            // DEBUG
            'p_release': 'debug_kill'
        };
    }
    
    work() {
        if (!this._core.getData('CONFIG_KEYS')) {
            this._core.publishData('CONFIG_KEYS', this.keyMap)
        }
    };
  }