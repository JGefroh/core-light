import { default as System } from '@core/system';
import { default as Core}  from '@core/core';
import { default as Entity } from '@core/entity.js'

export default class GameOverSystem extends System {
    constructor() {
      super()

      this.wait = 1000/60
      this.gameOver = false;
    }
    
    work() {
        if (!this.gameOver) {
            this._checkEnemiesRemaining();
        }
    };

    _checkEnemiesRemaining() {
        if (this._core.getData('ENEMY_COUNT') != null && this._core.getData('ENEMY_COUNT') <= 0) {
            this.send("ADD_GUI_RENDERABLE", {
                key: 'GAME_OVER',
                text: 'YOU WIN - GAME OVER',
                xPosition: (window.innerWidth / 2) - 300,
                yPosition: window.innerHeight / 4,
                width: 1000,
                height: 500,
                fontSize: 50,
                fontColor: 'green'
            })
            setTimeout(() => {
                window.location.reload()
            }, 10000)
        }
    }
}