
import { default as pathFragmentShaderSourceCode } from '@game/engine/renderer/shaders/path-fragment-shader';
import { default as pathVertexShaderSourceCode } from '@game/engine/renderer/shaders/path-vertex-shader';

import { compileShader } from '@game/engine/renderer/util/shader-util';

class PathProgram {
    constructor() {
        this.maxBufferSize = 50000 * 2 * 4;
        this.buffers = {};
        this.vertexArrayObjects = {};
        this.program = null;
    }

    initialize(renderCtx) {
        this._initializeProgram(renderCtx);
        this._initializeBuffers(renderCtx);
    }

    getProgram() {
        return this.program;
    }

    getVertexArrayObjects() {
        return this.vertexArrayObjects['PATH'];
    }

    getBuffers() {
        return this.buffers['PATH'];
    }

    
    _initializeProgram(renderCtx) {
      // Buffered
      const program = renderCtx.createProgram();

      let pathVertexShader = compileShader(renderCtx, pathVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
      renderCtx.attachShader(program, pathVertexShader);

      let pathFragmentShader = compileShader(renderCtx, pathFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
      renderCtx.attachShader(program, pathFragmentShader);

      renderCtx.linkProgram(program);

      this.program = {
        program: program,
        attributes: {},
        uniforms: {
          u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
          u_color: renderCtx.getUniformLocation(program, 'u_color')
        }
      }
    }
   
    _initializeBuffers(renderCtx) {
      const vao = renderCtx.createVertexArray();
      renderCtx.bindVertexArray(vao);
      this.vertexArrayObjects['PATH'] = vao;
  
      // Shader program for radial fill
      const program = this.program;
      renderCtx.useProgram(program.program);
  
      // Create and upload vertex buffer
      const buffer = this.buffers['PATH'] ||= renderCtx.createBuffer();
      renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
      renderCtx.bufferData(renderCtx.ARRAY_BUFFER, 0, renderCtx.STATIC_DRAW);
  
      // Set attribute
      const locPosition = renderCtx.getAttribLocation(program.program, 'a_position');
      renderCtx.enableVertexAttribArray(locPosition);
      renderCtx.vertexAttribPointer(locPosition, 2, renderCtx.FLOAT, false, 0, 0);
      renderCtx.vertexAttribDivisor(locPosition, 0); // per-vertex
  
      // Blending: additive
      renderCtx.enable(renderCtx.BLEND);
      renderCtx.blendFunc(renderCtx.SRC_ALPHA, renderCtx.ONE_MINUS_SRC_ALPHA);
  
      // Cleanup
      renderCtx.bindVertexArray(null);
      renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, null);
    }
  
    
}

export default PathProgram;