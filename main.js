import '@core/component';
import '@core/tag';


function setPageMetadata() {
    document.title = "Light by Joseph Gefroh";

    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/png'; // or 'image/x-icon' for .ico
    link.rel = 'icon';
    link.href = '/assets/images/favicon.ico';
    document.head.appendChild(link);
}
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

setPageMetadata();
defineCanvas();

import '@game/title/title-screen'