import '@core/component';
import '@core/tag';


function defineCanvas() {
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "canvas");
    document.body.appendChild(canvas);
    document.body.style = 'margin: 0px;'
    canvas.width  = window.innerWidth;;
    canvas.height = window.innerHeight;
    canvas.style.cursor = 'none';
    canvas.onclick =() => {
        canvas.requestPointerLock();
    }

    var offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.setAttribute("id", "canvas-offscreen");
    window.offScreenCanvas = offScreenCanvas;
    offScreenCanvas.width  = window.innerWidth;;
    offScreenCanvas.height = window.innerHeight;
}

import '@game/title/font-loader.js';

defineCanvas();

import '@game/title/title-screen'