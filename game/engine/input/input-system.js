import { default as System } from '@core/system';

export default class InputSystem extends System {
    constructor() {
        super();
        let self = this;

        this.lastKnownCursorPosition = {world: {xPosition: 0, yPosition: 0}, canvas: {xPosition: 0, yPosition: 0}}

        this.activeKeys = {};

        this.activeActions = {
        }

        let fireAppropriateEvent = (event, eventType) => {
            if (event.type.indexOf('keydown') !== -1) {
                this.activeKeys[event.key] = event.repeat ? 'hold' : 'press';
            }
            else if (event.type.indexOf('keyup') !== -1) {
                this.activeKeys[event.key] = 'release';
            }
            else if(event.type.indexOf('dblclick') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'double_click',  ...this._getCursorCoordinates(event)})
            }
            else if (event.type.indexOf('mousedown') !== -1) {
                this.activeKeys['mousedown'] = 'press';
            }
            else if (event.type.indexOf('mouseup') !== -1) {
                this.activeKeys['mouseup'] = 'release';
            }
            else if(event.type.indexOf('click') !== -1) {
                this.activeKeys['click'] = 'once';
                self.send("INPUT_RECEIVED", { type: 'click', ...this._getCursorCoordinates(event)});
                self._core.publishData('CURSOR_COORDINATES', this._getCursorCoordinates(event));
                this.send("DEBUG_DATA", {type: 'cursor', ...this._getCursorCoordinates(event)})
            }
            else if(event.type.indexOf('mouse') !== -1) {
                let cursorCoordinates =  this._getCursorCoordinates(event);
                self.send("INPUT_RECEIVED", { type: 'cursor_position', ...this._getCursorCoordinates(event)});
                self._core.publishData('CURSOR_COORDINATES', this._getCursorCoordinates(event));
                this.send("DEBUG_DATA", {type: 'cursor', ...this._getCursorCoordinates(event)})
            }
            else if (event.type.indexOf('scroll') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'scroll'})
            }
            else if (event.type.indexOf('contextmenu') !== -1) {
                self.send("INPUT_RECEIVED", { type: 'contextmenu', ...this._getCursorCoordinates(event)});
            }
        }

        window.onkeydown = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        
        };
        
        window.onkeyup = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        };

        window.onclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.onmousedown = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }
        window.onmouseup = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }


        window.onmousemove = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.ondblclick = function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event);
        }

        window.addEventListener('contextmenu', function(event) {
            event.stopPropagation();
            event.preventDefault();
            fireAppropriateEvent(event)
        });

        window.addEventListener('wheel', function(event) {
            // Your custom scroll event handling code here
            event.stopPropagation();
            event.preventDefault();
        });
    }

    work() {
        if (this.notYetTime(100, this.lastRanTimestamp)) {
            return;
        }
        if (!this.keyMap) {
            this.keyMap = this._core.getData('CONFIG_KEYS');
            if (!this.keyMap) {
                return;
            }
        }
        let shiftModifier = this.activeKeys['Shift']

        Object.keys(this.activeKeys).forEach((key) => {
            this.send("INPUT_RECEIVED", { type: 'action', action: this.keyMap[`${key}_${this.activeKeys[key]}${shiftModifier ? '_shift' : ''}`]});
            if (this.activeKeys[key] == 'release' || this.activeKeys[key] == 'once') {
                delete this.activeKeys[key]
            }
        });
        this.lastRanTimestamp = new Date();

        this.send("DEBUG_DATA", {type: 'key', key: Object.keys(this.activeKeys).join('')})
    }

    _getCursorCoordinates(event) {
        let viewport = this._core.getData('VIEWPORT');
        
        if (!viewport) {
            viewport = {xPosition: 0, yPosition: 0}
        }


        let canvasCoordinates = null;
        let worldCoordinates = null;
        
        if (document.pointerLockElement) {
            canvasCoordinates = {
                xPosition: this.lastKnownCursorPosition.canvas.xPosition + event.movementX,
                yPosition: this.lastKnownCursorPosition.canvas.yPosition + event.movementY
            };

            worldCoordinates = {
                xPosition: this.lastKnownCursorPosition.world.xPosition + event.movementX / viewport.scale,
                yPosition: this.lastKnownCursorPosition.world.yPosition + event.movementY / viewport.scale
            };
        } else {
            canvasCoordinates = {
                xPosition: event.offsetX,
                yPosition: event.offsetY
            };

            worldCoordinates = {
                xPosition: (event.offsetX + viewport.xPosition) / viewport.scale,
                yPosition: (event.offsetY + viewport.yPosition) / viewport.scale
            };
        }

        let result = {
            canvas: canvasCoordinates,
            world: worldCoordinates 
        }

        this.lastKnownCursorPosition = result;

        return result
    }
  }