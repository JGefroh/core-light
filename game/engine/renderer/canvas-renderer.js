import { default as System } from '@core/system';

export default class CanvasRenderer extends System {

    drawCanvasLayer(renderCtx, layer) {
        renderCtx.save();
        renderCtx.globalCompositeOperation = layer.applyOptions.globalCompositeOperation || renderCtx.globalCompositeOperation;
        renderCtx.filter = layer.applyOptions.filter || renderCtx.filter;
        renderCtx.drawImage(layer.canvas, 0, 0);
        renderCtx.restore();
    }

    saveContext(renderCtx) {
        renderCtx.save();
    }

    restoreContext(renderCtx) {
        renderCtx.restore();
    }

    preFrame() {
        // no-op
    }

    forceDraw() {
        //no-op
    }

    postFrame() {
        // no-op
    }

    loadTexture(texture) {
        // no-op
    }

    clearScreen(renderCtx, clearScreenColor) {
        renderCtx.save()
        renderCtx.clearRect(0, 0, renderCtx.canvas.width, renderCtx.canvas.height);
        renderCtx.fillStyle = clearScreenColor;
        renderCtx.fillRect(0, 0, renderCtx.canvas.width, renderCtx.canvas.height);
        renderCtx.restore()
    }

    drawShape(renderCtx, viewport, shape, shapeWidth, shapeHeight, xPosition, yPosition, angleDegrees, color) {
      const scale = viewport.scale;
  
      // Only scale width/height
      const scaledWidth = shapeWidth * scale;
      const scaledHeight = shapeHeight * scale;
  
      // Use unscaled position here
      this._positionCanvasForRendering(renderCtx, viewport, xPosition, yPosition, angleDegrees);
  
      const offsetX = -this._calculateCenter(scaledWidth);
      const offsetY = -this._calculateCenter(scaledHeight);
  
      renderCtx.globalCompositeOperation = 'source-atop';
      renderCtx.fillStyle = color;
  
      if (!shape || shape === 'rectangle') {
          renderCtx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);
      } else if (shape === 'circle') {
          renderCtx.beginPath();
          renderCtx.arc(offsetX + scaledWidth / 2, offsetY + scaledHeight / 2, scaledWidth / 2, 0, 2 * Math.PI);
          renderCtx.fill();
      } else if (shape === 'blob') {
          renderCtx.beginPath();
  
          const centerX = offsetX + scaledWidth / 2;
          const centerY = offsetY + scaledHeight / 2;
          const radius = scaledWidth / 2;
  
          const seed = xPosition * 17 + yPosition * 23 + angleDegrees * 3;
          const offsets = this._generateOffsets(seed);
          const points = offsets.length;
          for (let i = 0; i <= points; i++) {
              const angle = (i / points) * 2 * Math.PI;
              const r = radius * offsets[i % points];
              const px = centerX + r * Math.cos(angle);
              const py = centerY + r * Math.sin(angle);
  
              if (i === 0) {
                  renderCtx.moveTo(px, py);
              } else {
                  renderCtx.lineTo(px, py);
              }
          }
  
          renderCtx.closePath();
          renderCtx.fill();
      }
  }
  
  drawImage(renderCtx, viewport, img, imageWidth, imageHeight, xPosition, yPosition) {
    const scale = viewport.scale;

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Use unscaled position here
    const translatedX = xPosition * scale - viewport.xPosition;
    const translatedY = yPosition * scale - viewport.yPosition;

    renderCtx.globalCompositeOperation = 'source-atop';
    renderCtx.drawImage(img, translatedX, translatedY, scaledWidth, scaledHeight);
  }

  drawLightPath(renderCtx, viewport, xPosition, yPosition, pathPoints, {fill = 'rgba(255,255,255,1)', blendMode = 'source-over', returnToOrigin = true, arcSize = 700}) {
    if (!pathPoints.length) return;

    const sourceX = xPosition * viewport.scale - viewport.xPosition;
    const sourceY = yPosition * viewport.scale - viewport.yPosition;
   
    // Create a clipping path for cone or full fan
    renderCtx.save(); // Save before clipping

    renderCtx.beginPath();
    renderCtx.moveTo(sourceX, sourceY);
    for (const pathPoint of pathPoints) {
        const x = pathPoint.x * viewport.scale - viewport.xPosition;
        const y = pathPoint.y * viewport.scale - viewport.yPosition;
        renderCtx.lineTo(x, y);
    }

    // Close path only if it's a full fan (point light)
    if (returnToOrigin) {
        const first = pathPoints[0];
        renderCtx.lineTo(first.x * viewport.scale - viewport.xPosition, first.y * viewport.scale - viewport.yPosition);
    }

    renderCtx.closePath();
    renderCtx.clip(); // Restrict gradient to shape

    // Fill clipped cone/fan
    renderCtx.fillStyle = this._getFillStyle(renderCtx, fill, sourceX, sourceY, arcSize * viewport.scale);
    renderCtx.beginPath();
    renderCtx.arc(sourceX, sourceY, arcSize, 0, Math.PI * 2); // big circle to ensure full gradient
    renderCtx.fill();

    renderCtx.restore(); // Restore clipping
    }

    _positionCanvasForRendering(renderCtx, viewport, xPosition, yPosition, angleDegrees) {
      const angleRadians = angleDegrees * (Math.PI / 180);

      let translateXPosition = (xPosition  * viewport.scale - (viewport.xPosition)) 
      let translateYPosition = (yPosition * viewport.scale - (viewport.yPosition))  

      renderCtx.translate(translateXPosition, translateYPosition);
      renderCtx.rotate(angleRadians)
    }
    
    _calculateCenter(size) {
      return (size / 2)
    }

    // Generates random offsets for blob randomness
    _generateOffsets(seed, count = 8) {
        let offsets = [];
        for (let i = 0; i < count; i++) {
            const s = seed + i * 31.4159; // spacing avoids repetition
            offsets.push(0.8 + this._seededRandom(s) * 0.4);
        }
        return offsets;
    }

    // Get a consistent random value
    _seededRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }


    _getFillStyle(renderCtx, fill, x, y, maxDistance) {
        if (!Array.isArray(fill)) {
            return fill;
        }

        const gradient = renderCtx.createRadialGradient(
            x, y, 0,
            x, y, maxDistance
        );

        for (let [offset, color] of fill) {
            gradient.addColorStop(offset, color);
        }

        return gradient;
    }

} 

