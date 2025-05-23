import { default as System } from '@core/system';
import Colors from '../util/colors';

import { compileShader } from './util/shader-util';

import { default as quadVertexShaderSourceCode } from './shaders/quad-vertex-shader';
import { default as quadFragmentShaderSourceCode } from './shaders/quad-fragment-shader';
import { default as quadAsCircleFragmentShaderSourceCode } from './shaders/quad-as-circle-fragment-shader';
import { default as quadAsLightFragmentShaderSourceCode } from './shaders/quad-as-light-fragment-shader';
import { default as pathFragmentShaderSourceCode } from './shaders/path-fragment-shader';
import { default as pathRadialFragmentShaderSourceCode } from './shaders/path-radial-fragment-shader';
import { default as pathVertexShaderSourceCode } from './shaders/path-vertex-shader';
import LightPathProgram from './webgl2-programs/light-path-program';
import PathProgram from './webgl2-programs/path-program';

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
      'light': 'LIGHT',
      'path': 'PATH'
    }

    this.perFrameCache = {}

    // Quads for Shapes - old programs
    this._initializeQuadProgram(renderCtx)
    this._initializeCircleProgram(renderCtx)
    this._initializeLightProgram(renderCtx)
    this._initializeQuadBuffers(renderCtx)


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

    const projectionMatrix = this._buildProjectionMatrix(renderCtx, viewport);
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

    const projectionMatrix = this._buildProjectionMatrix(renderCtx, viewport);
    renderCtx.uniformMatrix4fv(program.uniforms.u_projectionMatrix, false, projectionMatrix);

    // Gradient (for in to out fuzziness)
    const { stopCount, stops, colors } = this._parseGradientStops(fill);
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
    if (!shape || !this.perFrameCache['instanceBuffers'][shape]?.offsets?.length) {
      return;
    }

    const instanceBuffersForShape = this.perFrameCache['instanceBuffers'][shape];
    const instanceCount = instanceBuffersForShape.offsets.length / 2;
    if (instanceCount === 0) return;

    let programName = this.programNameByShapeName[shape] || 'QUAD'
    const program = this.programs[programName];
    renderCtx.useProgram(program.program);

    // Set up textures if any are loaded.
    if (this.textureDetails) {
      renderCtx.activeTexture(renderCtx.TEXTURE0);
      renderCtx.bindTexture(renderCtx.TEXTURE_2D, this.textureDetails.texture);
      renderCtx.uniform1i(renderCtx.getUniformLocation(program.program, 'u_texture0'), 0);
    }

    let index = this._getFlushIndex();
    const vao = this.vertexArrayObjects[`${programName}_${index}`];
    renderCtx.bindVertexArray(vao);
    let projectionMatrix = this.perFrameCache['projectionMatrix']
    renderCtx.uniformMatrix4fv(program.uniforms['u_projectionMatrix'], false, projectionMatrix);

    // Offsets and positions
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_OFFSET_${index}`, instanceBuffersForShape.offsets)

    // Colors
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_COLOR_${index}`, instanceBuffersForShape.colors)

    // Scale
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_SCALE_${index}`, instanceBuffersForShape.scales)

    // Angles
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_ANGLE_${index}`, instanceBuffersForShape.angles)

    // Borders
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_BORDER_SIZE_${index}`, instanceBuffersForShape.borderSizes)
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_BORDER_COLOR_${index}`, instanceBuffersForShape.borderColors)

    // Textures
    this._bindToBufferIfExists(renderCtx, `${programName}_INSTANCE_TEXTURE_UV_BOUNDS_${index}`, instanceBuffersForShape.textureUVBounds)

    renderCtx.drawArraysInstanced(renderCtx.TRIANGLES, 0, 6, instanceCount);

    // Clear
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);

    this._clearInstanceBufferForShape(shape);
    this._ensureInstanceBufferForShape(shape)
  }

  _bindToBufferIfExists(renderCtx, key, array) {
    const buffer = this.buffers[key];

    if (!array?.length) {
      return;
    }
    renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
    renderCtx.bufferSubData(renderCtx.ARRAY_BUFFER, 0, new Float32Array(array));
  }

  ///// WEBGL2 Setup

  _initializeQuadProgram(renderCtx) {
    // Buffered
    const program = renderCtx.createProgram();

    let quadVertexShader = compileShader(renderCtx, quadVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
    renderCtx.attachShader(program, quadVertexShader);

    let quadFragmentShader = compileShader(renderCtx, quadFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
    renderCtx.attachShader(program, quadFragmentShader);

    renderCtx.linkProgram(program);

    this.programs['QUAD'] = {
      program: program,
      attributes: {},
      uniforms: {
        u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
      }
    }
  }

  _initializeCircleProgram(renderCtx) {
    // Buffered
    const program = renderCtx.createProgram();

    let quadVertexShader = compileShader(renderCtx, quadVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
    renderCtx.attachShader(program, quadVertexShader);

    let quadAsCircleFragmentShader = compileShader(renderCtx, quadAsCircleFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
    renderCtx.attachShader(program, quadAsCircleFragmentShader);

    renderCtx.linkProgram(program);

    this.programs['CIRCLE'] = {
      program: program,
      attributes: {},
      uniforms: {
        u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
      }
    }
  }

  _initializePathProgram(renderCtx) {
    let program = new PathProgram();
    program.initialize(renderCtx);
    this.programs['PATH'] = program;
  }


  _initializeLightProgram(renderCtx) {
    // Buffered
    const program = renderCtx.createProgram();

    let quadVertexShader = compileShader(renderCtx, quadVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
    renderCtx.attachShader(program, quadVertexShader);

    let quadAsLightFragmentShader = compileShader(renderCtx, quadAsLightFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
    renderCtx.attachShader(program, quadAsLightFragmentShader);

    renderCtx.linkProgram(program);

    this.programs['LIGHT'] = {
      program: program,
      attributes: {},
      uniforms: {
        u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
      }
    }
  }

  _initializeRaycastLightProgram(renderCtx) {
    let program = new LightPathProgram();
    program.initialize(renderCtx);
    this.programs['LIGHT_PATH'] = program;
  }

  _initializeBuffers(renderCtx, programType) {
    const program = this.programs[programType];

    for (let index = 0; index < this.flushCountMax; index++) {
      const vao = renderCtx.createVertexArray();
      renderCtx.bindVertexArray(vao);
      this.vertexArrayObjects[`${programType}_${index}`] = vao;

      // === Per-vertex position (static geometry for quad) ===
      const quadVertices = new Float32Array([
        -0.5, -0.5,
        0.5, -0.5,
        -0.5, 0.5,
        -0.5, 0.5,
        0.5, -0.5,
        0.5, 0.5
      ]);
      const quadVertexBuffer = renderCtx.createBuffer();
      this.buffers[`${programType}_${index}`] = quadVertexBuffer;
      renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, quadVertexBuffer);
      renderCtx.bufferData(renderCtx.ARRAY_BUFFER, quadVertices, renderCtx.STATIC_DRAW);

      renderCtx.enableVertexAttribArray(0);
      renderCtx.vertexAttribPointer(0, 2, renderCtx.FLOAT, false, 0, 0);
      renderCtx.vertexAttribDivisor(0, 0); // per-vertex

      // === Per-instance offset (vec2) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_OFFSET`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
        const locOffset = renderCtx.getAttribLocation(program.program, 'a_instanceOffset');
        renderCtx.enableVertexAttribArray(locOffset);
        renderCtx.vertexAttribPointer(locOffset, 2, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locOffset, 1); // per-instance
      })
      // === Per-instance color (vec4) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_COLOR`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
        const locColor = renderCtx.getAttribLocation(program.program, 'a_instanceColor');
        renderCtx.enableVertexAttribArray(locColor);
        renderCtx.vertexAttribPointer(locColor, 4, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locColor, 1); // per-instance
      })

      // === Per-instance scale (vec2) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_SCALE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
        const locScale = renderCtx.getAttribLocation(program.program, 'a_instanceScale');
        renderCtx.enableVertexAttribArray(locScale);
        renderCtx.vertexAttribPointer(locScale, 2, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locScale, 1); // per-instance
    
      })
      // === Per-instance angle (float) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_ANGLE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
        const locAngle = renderCtx.getAttribLocation(program.program, 'a_instanceAngleDegrees');
        renderCtx.enableVertexAttribArray(locAngle);
        renderCtx.vertexAttribPointer(locAngle, 1, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locAngle, 1); // per-instance
      })

      // === Per-instance border size (float) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_BORDER_SIZE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
        const locBorderSize = renderCtx.getAttribLocation(program.program, 'a_instanceBorderSize');
        renderCtx.enableVertexAttribArray(locBorderSize);
        renderCtx.vertexAttribPointer(locBorderSize, 1, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locBorderSize, 1); // per-instance
      })
      
      // === Per-instance border color (vec4) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_BORDER_COLOR`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
        const locBorderColor = renderCtx.getAttribLocation(program.program, 'a_instanceBorderColor');
        renderCtx.enableVertexAttribArray(locBorderColor);
        renderCtx.vertexAttribPointer(locBorderColor, 4, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locBorderColor, 1); // per-instance
      })
      
      // === Per-instance UV for a texture (vec4) ===
      this.initializeBuffersFor(renderCtx, `${programType}_INSTANCE_TEXTURE_UV_BOUNDS`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
        const locTextureUV = renderCtx.getAttribLocation(program.program, 'a_instanceTextureUvBounds');
        renderCtx.enableVertexAttribArray(locTextureUV);
        renderCtx.vertexAttribPointer(locTextureUV, 4, renderCtx.FLOAT, false, 0, 0);
        renderCtx.vertexAttribDivisor(locTextureUV, 1); // per-instance
      })

      // Clean up
      renderCtx.bindVertexArray(null);
      renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);
    }
  }

  initializeBuffersFor(renderCtx, key, size = this.maxBufferSize, drawType = renderCtx.DYNAMIC_DRAW, index, vertexBindFn = () => {}) {
      let buffer = renderCtx.createBuffer()
      this.buffers[`${key}_${index}`] = buffer;
      renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
      renderCtx.bufferData(renderCtx.ARRAY_BUFFER, size, drawType); // dummy size

      vertexBindFn()
  }

  _initializeQuadBuffers(renderCtx) {
    this._initializeBuffers(renderCtx, 'QUAD')
    this._initializeBuffers(renderCtx, 'CIRCLE')
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

  _parseGradientStops(fillArray) {
    const stops = [];
    const colors = [];

    for (const [offset, colorStr] of fillArray) {
      const rgba = this.colorUtil.colorToRaw(colorStr, 255); // returns {r, g, b, a}
      stops.push(offset);
      colors.push(rgba.r, rgba.g, rgba.b, rgba.a);
    }

    return {
      stopCount: fillArray.length,
      stops: new Float32Array(stops),
      colors: new Float32Array(colors)
    };
  }
} 