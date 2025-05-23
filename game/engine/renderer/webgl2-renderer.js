import { default as System } from '@core/system';
import Colors from '../util/colors';

import LightPathProgram from './webgl2-programs/light-path-program';
import PathProgram from './webgl2-programs/path-program';
import QuadProgram from './webgl2-programs/quad-program';
import CircleProgram from './webgl2-programs/circle-program';

export default class WebGl2Renderer {

  constructor(renderCtx) {
    this.maxBufferSize = 50000 * 2 * 4;
    this.programs = {}
    this.vertexArrayObjects = {}
    this.buffers = {}
    this.flushIndex = 0;
    this.flushCountMax = 60;
    this.textureDetails = null;

    this.programNameByShapeName = {
      'rectangle': 'QUAD',
      'circle': 'CIRCLE',
      'blob': 'QUAD',
      'path': 'PATH'
    }

    this.perFrameCache = {}

    // Quads for Shapes - old programs
    this._initializeQuadProgram(renderCtx)
    this._initializeCircleProgram(renderCtx)

    // Refactored programs
    this._initializePathProgram(renderCtx);
    this._initializeRaycastLightProgram(renderCtx);

    this.colorUtil = new Colors();
  }

  drawCanvasLayer(renderCtx, layer) {
  }

  saveContext(renderCtx) {
  }

  restoreContext(renderCtx) {
  }

  loadTexture(renderCtx, textureDetails) {
    const texture = renderCtx.createTexture();
    renderCtx.bindTexture(renderCtx.TEXTURE_2D, texture);
    textureDetails.texture = texture;

    renderCtx.texImage2D(
      renderCtx.TEXTURE_2D,
      0,
      renderCtx.RGBA,
      renderCtx.RGBA,
      renderCtx.UNSIGNED_BYTE,
      textureDetails.atlasImage
    );

    renderCtx.texParameteri(renderCtx.TEXTURE_2D, renderCtx.TEXTURE_WRAP_S, renderCtx.CLAMP_TO_EDGE);
    renderCtx.texParameteri(renderCtx.TEXTURE_2D, renderCtx.TEXTURE_WRAP_T, renderCtx.CLAMP_TO_EDGE);
    renderCtx.texParameteri(renderCtx.TEXTURE_2D, renderCtx.TEXTURE_MIN_FILTER, renderCtx.NEAREST);
    renderCtx.texParameteri(renderCtx.TEXTURE_2D, renderCtx.TEXTURE_MAG_FILTER, renderCtx.NEAREST);

    this.textureDetails = textureDetails; //TODO: Make this support multiple textures when the need eventually arises.
  }

  clearScreen(renderCtx, clearScreenColor) {
    const color = this.colorUtil.colorToRaw(clearScreenColor, 255);
    renderCtx.clearColor(color.r, color.g, color.b, color.a);
    renderCtx.clear(renderCtx.COLOR_BUFFER_BIT | renderCtx.DEPTH_BUFFER_BIT);
  }

  positionCanvasForRendering(renderCtx, xPosition, yPosition, angleRadians) {
  }

  preFrame(renderCtx, viewport) {
    // Run once per frame
    this.perFrameCache = {};
    this.perFrameCache['projectionMatrix'] = this._buildProjectionMatrix(renderCtx, viewport)
    this.perFrameCache['lastUsedVaoType'] = null;

    // Cache related to internal rendering deferrals by shape
    this.perFrameCache['instanceBuffers'] = {}
    this.perFrameCache['lastDrawnShape'] = null;

    this.flushCalls = 0;
  }

  forceDraw(renderCtx, viewport) {
    Object.keys(this.perFrameCache['instanceBuffers']).forEach((key) => {
      this._flushFrameBuffer(renderCtx, viewport, key);
    })
    renderCtx.flush()
  }

  postFrame(renderCtx, viewport) {
    this.forceDraw(renderCtx, viewport);
    renderCtx.bindVertexArray(null); // Optional cleanup
  }

  drawShape(renderCtx, viewport, shape, shapeWidth, shapeHeight, xPosition, yPosition, angleDegrees, color, options = {}) {
    if (options.imagePath) {
      options.textureUVBounds = this._getTextureUVBounds(options.imagePath);
    }
    this._ensureInstanceBufferForShape(shape)
    this._pushToBuffer(shape, shapeWidth, shapeHeight, xPosition, yPosition, angleDegrees, color, options);
  }

  drawImage(renderCtx, viewport, img, imageWidth, imageHeight, xPosition, yPosition, angleDegrees, color, options = {}) {
    // no-op, the WebGL2 renderer uses drawShape with an imagePath option keyed on the texture atlas
  }

  drawPath(renderCtx, viewport, xPosition, yPosition, pathPoints, pathColor, {
    returnToOrigin = false
  }) {
    if (!pathPoints?.length) return;

    // Bind the array and use the program
    const vao = this.programs['PATH'].getVertexArrayObjects();
    renderCtx.bindVertexArray(vao);
    const program = this.programs['PATH'].getProgram();
    renderCtx.useProgram(program.program);

    const flatPoints = new Float32Array(pathPoints.flatMap(p => [p.x, p.y]));
    const buffer = this.programs['PATH'].getBuffers();

    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
    renderCtx.bufferData(renderCtx.ARRAY_BUFFER, flatPoints, renderCtx.DYNAMIC_DRAW);

    const projectionMatrix = this.perFrameCache['projectionMatrix'] || this._buildProjectionMatrix(renderCtx, viewport);
    renderCtx.uniformMatrix4fv(program.uniforms.u_projectionMatrix, false, projectionMatrix);

    if (program.uniforms.u_color) {
      const colorObject = this.colorUtil.colorToRaw(pathColor, 255);
      renderCtx.uniform4f(program.uniforms.u_color, ...[colorObject.r, colorObject.g, colorObject.b, colorObject.a]);
    }

    renderCtx.drawArrays(renderCtx.LINE_STRIP, 0, pathPoints.length);
    
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);
  }

  drawLightPath(renderCtx, viewport, xPosition, yPosition, pathPoints, {
    returnToOrigin = true,
    arcSize = 1000,
    fill = [], // array of [offset, rgba],

    // Optional for edge feathering
    startAngleRadians = null,
    endAngleRadians = null,
    softnessRadians = null
    
  }) {
    if (!pathPoints?.length) return;

    const vao = this.programs['LIGHT_PATH'].getVertexArrayObjects();
    renderCtx.bindVertexArray(vao);
    const program = this.programs['LIGHT_PATH'].getProgram();
    renderCtx.useProgram(program.program);

    const vertices = this._triangulatePath(pathPoints, xPosition, yPosition);
    const buffer = this.programs['LIGHT_PATH'].getBuffers();
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
    renderCtx.bufferData(renderCtx.ARRAY_BUFFER, vertices, renderCtx.STATIC_DRAW);

    const projectionMatrix = this.perFrameCache['projectionMatrix'] || this._buildProjectionMatrix(renderCtx, viewport);
    renderCtx.uniformMatrix4fv(program.uniforms.u_projectionMatrix, false, projectionMatrix);

    // Gradient (for in to out fuzziness)
    const { stopCount, stops, colors } = this.colorUtil.parseGradientStops(fill);
    renderCtx.uniform1i(program.uniforms.u_stopCount, stopCount);
    renderCtx.uniform1fv(program.uniforms.u_stops, stops);
    renderCtx.uniform4fv(program.uniforms.u_colors, colors);
    
    // Upload center and radius
    renderCtx.uniform2f(program.uniforms.u_center, xPosition, yPosition);
    renderCtx.uniform1f(program.uniforms.u_radius, arcSize);

    // Edge feathering
    renderCtx.uniform1i(program.uniforms.u_isCone, startAngleRadians != null);
    renderCtx.uniform1f(program.uniforms.u_startAngleRadians, startAngleRadians || 0.0);
    renderCtx.uniform1f(program.uniforms.u_endAngleRadians, endAngleRadians || 0.0);
    renderCtx.uniform1f(program.uniforms.u_softnessRadians, softnessRadians || 0.0);

    // Draw triangles
    const vertexCount = vertices.length / 2;
    renderCtx.drawArrays(renderCtx.TRIANGLES, 0, vertexCount);

    // Cleanup
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);
  }

  ///// Rendering deferrals
  _ensureInstanceBufferForShape(shape) {
    this.perFrameCache['instanceBuffers'] ||= {}
    this.perFrameCache['instanceBuffers'][shape] ||= {
      offsets: [],
      colors: [],
      angles: [],
      scales: [],
      borderSizes: [],
      borderColors: [],
      textureUVBounds: [],
    }
  }

  _clearInstanceBufferForShape(shape) {
    // Keep variables but change size - or else the buffers will not be bound correctly
    Object.values(this.perFrameCache['instanceBuffers'][shape]).forEach((array) => {
      array.length = 0;
    });
  }

  _pushToBuffer(shape, shapeWidth, shapeHeight, xPosition, yPosition, angleDegrees, color, options = {}) {
    this.perFrameCache['instanceBuffers'][shape].offsets.push(xPosition, yPosition)
    this.perFrameCache['instanceBuffers'][shape].angles.push(angleDegrees)
    this.perFrameCache['instanceBuffers'][shape].scales.push(shapeWidth, shapeHeight)

    let colorObject = this.colorUtil.colorToRaw(color, 255);
    this.perFrameCache['instanceBuffers'][shape].colors.push(...[colorObject.r, colorObject.g, colorObject.b, colorObject.a])

    this.perFrameCache['instanceBuffers'][shape].borderSizes.push(options.borderSize || 0.0);

    this.perFrameCache['instanceBuffers'][shape].textureUVBounds.push(
      ...(options.textureUVBounds || [0, 0, 0, 0]) // [0,0,0,0] will be ignored by the fragment shader
    );

    const borderColorObject = this.colorUtil.colorToRaw(options.borderColor || 'rgba(0,0,0,0)', 255);
    this.perFrameCache['instanceBuffers'][shape].borderColors.push(...[borderColorObject.r, borderColorObject.g, borderColorObject.b, borderColorObject.a]);
  }

  _getTextureUVBounds(imagePath) {
    if (!this.textureDetails) {
      return null; // No texture loaded.
    }
    let image = this.textureDetails.images[imagePath]

    if (!image) {
      return null; // Can't find image.
    }

    if (!image.uv) {
      // Calculate and cache UV
      const u0 = image.atlasXPosition / this.textureDetails.width;
      const v0 = image.atlasYPosition / this.textureDetails.height;
      const u1 = (image.atlasXPosition + image.width) / this.textureDetails.width;
      const v1 = (image.atlasYPosition + image.height) / this.textureDetails.height;
  
      image.uv = [u0, v0, u1, v1];
    }

    return image.uv
  }

  _getFlushIndex() {
    this.flushIndex = (this.flushIndex + 1) % this.flushCountMax;
    return this.flushIndex;
  }

  _flushFrameBuffer(renderCtx, viewport, shape) {
    const instanceBuffersForShape = this.perFrameCache['instanceBuffers'][shape];
    if (!instanceBuffersForShape || !instanceBuffersForShape?.offsets?.length) {
      return;
    }

    let programName = this.programNameByShapeName[shape] || 'QUAD'

    const program = this.programs[programName].getProgram();
    renderCtx.useProgram(program.program);

    // Set up textures if any are loaded.
    if (this.textureDetails) {
      renderCtx.activeTexture(renderCtx.TEXTURE0);
      renderCtx.bindTexture(renderCtx.TEXTURE_2D, this.textureDetails.texture);
      renderCtx.uniform1i(renderCtx.getUniformLocation(program.program, 'u_texture0'), 0);
    }

    let index = this._getFlushIndex();

    renderCtx.bindVertexArray(this.programs[programName].getVertexArrayObjects()[`${index}`]);
    renderCtx.uniformMatrix4fv(program.uniforms['u_projectionMatrix'], false, this.perFrameCache['projectionMatrix']);

    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_OFFSET_${index}`, instanceBuffersForShape.offsets)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_SCALE_${index}`, instanceBuffersForShape.scales)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_ANGLE_${index}`, instanceBuffersForShape.angles)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_TEXTURE_UV_BOUNDS_${index}`, instanceBuffersForShape.textureUVBounds)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_COLOR_${index}`, instanceBuffersForShape.colors)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_BORDER_SIZE_${index}`, instanceBuffersForShape.borderSizes)
    this._bindToBufferIfExists(renderCtx, this.programs[programName].getBuffers(), `INSTANCE_BORDER_COLOR_${index}`, instanceBuffersForShape.borderColors)

    renderCtx.drawArraysInstanced(renderCtx.TRIANGLES, 0, 6, instanceBuffersForShape.offsets.length / 2);

    // Clear
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);

    this._clearInstanceBufferForShape(shape);
    this._ensureInstanceBufferForShape(shape)
  }

  _bindToBufferIfExists(renderCtx, buffers, key, array) {
    const buffer = buffers[key];

    if (!array?.length) {
      return;
    }
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
    renderCtx.bufferSubData(renderCtx.ARRAY_BUFFER, 0, new Float32Array(array));
  }

  ///// WEBGL2 Setup

  _initializeQuadProgram(renderCtx) {
    let program = new QuadProgram({flushCountMax: this.flushCountMax});
    program.initialize(renderCtx);
    this.programs['QUAD'] = program;
  }

  _initializeCircleProgram(renderCtx) {
    let program = new CircleProgram({flushCountMax: this.flushCountMax});
    program.initialize(renderCtx);
    this.programs['CIRCLE'] = program;
  }

  _initializePathProgram(renderCtx) {
    let program = new PathProgram();
    program.initialize(renderCtx);
    this.programs['PATH'] = program;
  }

  _initializeRaycastLightProgram(renderCtx) {
    let program = new LightPathProgram();
    program.initialize(renderCtx);
    this.programs['LIGHT_PATH'] = program;
  }

  _buildProjectionMatrix(renderCtx, viewport) {
    const canvasWidth = renderCtx.canvas.width;
    const canvasHeight = renderCtx.canvas.height;
    const baseScale = viewport.scale;
    const scaled = baseScale;
  
    // Compute visible world area size at this zoom
    const viewWidthWorld = canvasWidth / scaled;
    const viewHeightWorld = canvasHeight / scaled;
  
    // Center of screen in world space
    const cx = viewport.xPosition / baseScale + canvasWidth / (2 * baseScale);
    const cy = viewport.yPosition / baseScale + canvasHeight / (2 * baseScale);

    // Compute new bounds centered on screen center
    const left = cx - viewWidthWorld / 2;
    const right = cx + viewWidthWorld / 2;
    const top = cy - viewHeightWorld / 2;
    const bottom = cy + viewHeightWorld / 2;
  
    const sx = 2 / (right - left);
    const sy = 2 / (top - bottom); // keep Y up
    const tx = -(right + left) / (right - left);
    const ty = -(top + bottom) / (top - bottom);
  
    return new Float32Array([
      sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, -1, 0,
      tx, ty, 0, 1
    ]);
  }

  _triangulatePath(pathPoints, xPosition, yPosition) {
    const vertices = [];

    for (let i = 0; i < pathPoints.length - 1; i++) {
      // Triangle: origin → pt[i] → pt[i+1]
      vertices.push(
        xPosition, yPosition,
        pathPoints[i].x, pathPoints[i].y,
        pathPoints[i + 1].x, pathPoints[i + 1].y
      );
    }

    return new Float32Array(vertices);
  }
} 