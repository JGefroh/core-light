
import { default as quadFragmentShaderSourceCode } from '@game/engine/renderer/shaders/quad-fragment-shader';
import { default as quadVertexShaderSourceCode } from '@game/engine/renderer/shaders/quad-vertex-shader';

import { compileShader } from '@game/engine/renderer/util/shader-util';

class QuadProgram {
    constructor(config) {
        this.maxBufferSize = 50000 * 2 * 4;
        this.buffers = {};
        this.vertexArrayObjects = {};
        this.program = null;

        //
        this.flushCountMax = config.flushCountMax || 60;
    }

    initialize(renderCtx) {
        this._initializeProgram(renderCtx);
        this._initializeBuffers(renderCtx);
    }

    getProgram() {
        return this.program;
    }

    getVertexArrayObjects() {
        return this.vertexArrayObjects['QUAD'];
    }

    getBuffers() {
        return this.buffers['QUAD'];
    }

    
    _initializeProgram(renderCtx) {
        const program = renderCtx.createProgram();

        let quadVertexShader = compileShader(renderCtx, quadVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
        renderCtx.attachShader(program, quadVertexShader);

        let quadFragmentShader = compileShader(renderCtx, quadFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
        renderCtx.attachShader(program, quadFragmentShader);

        renderCtx.linkProgram(program);

        this.program = {
            program: program,
            attributes: {},
            uniforms: {
            u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
            }
        }
    }

    _initializeBuffers(renderCtx) {
        const program = this.program;
        this.vertexArrayObjects['QUAD'] = {};
        this.buffers['QUAD'] = {};
    
        for (let index = 0; index < this.flushCountMax; index++) {
          const vao = renderCtx.createVertexArray();
          renderCtx.bindVertexArray(vao);
          this.vertexArrayObjects['QUAD'][`${index}`] = vao;
    
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
          this.buffers['QUAD'][`${index}`] = quadVertexBuffer;
          renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, quadVertexBuffer);
          renderCtx.bufferData(renderCtx.ARRAY_BUFFER, quadVertices, renderCtx.STATIC_DRAW);
    
          renderCtx.enableVertexAttribArray(0);
          renderCtx.vertexAttribPointer(0, 2, renderCtx.FLOAT, false, 0, 0);
          renderCtx.vertexAttribDivisor(0, 0); // per-vertex
    
          // === Per-instance offset (vec2) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_OFFSET`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
            const locOffset = renderCtx.getAttribLocation(program.program, 'a_instanceOffset');
            renderCtx.enableVertexAttribArray(locOffset);
            renderCtx.vertexAttribPointer(locOffset, 2, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locOffset, 1); // per-instance
          })
          // === Per-instance color (vec4) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_COLOR`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
            const locColor = renderCtx.getAttribLocation(program.program, 'a_instanceColor');
            renderCtx.enableVertexAttribArray(locColor);
            renderCtx.vertexAttribPointer(locColor, 4, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locColor, 1); // per-instance
          })
    
          // === Per-instance scale (vec2) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_SCALE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
            const locScale = renderCtx.getAttribLocation(program.program, 'a_instanceScale');
            renderCtx.enableVertexAttribArray(locScale);
            renderCtx.vertexAttribPointer(locScale, 2, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locScale, 1); // per-instance
        
          })
          // === Per-instance angle (float) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_ANGLE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
            const locAngle = renderCtx.getAttribLocation(program.program, 'a_instanceAngleDegrees');
            renderCtx.enableVertexAttribArray(locAngle);
            renderCtx.vertexAttribPointer(locAngle, 1, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locAngle, 1); // per-instance
          })
    
          // === Per-instance border size (float) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_BORDER_SIZE`, this.maxBufferSize, renderCtx.DYNAMIC_DRAW, index, () => {
            const locBorderSize = renderCtx.getAttribLocation(program.program, 'a_instanceBorderSize');
            renderCtx.enableVertexAttribArray(locBorderSize);
            renderCtx.vertexAttribPointer(locBorderSize, 1, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locBorderSize, 1); // per-instance
          })
          
          // === Per-instance border color (vec4) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_BORDER_COLOR`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
            const locBorderColor = renderCtx.getAttribLocation(program.program, 'a_instanceBorderColor');
            renderCtx.enableVertexAttribArray(locBorderColor);
            renderCtx.vertexAttribPointer(locBorderColor, 4, renderCtx.FLOAT, false, 0, 0);
            renderCtx.vertexAttribDivisor(locBorderColor, 1); // per-instance
          })
          
          // === Per-instance UV for a texture (vec4) ===
          this.initializeBuffersFor(renderCtx, `INSTANCE_TEXTURE_UV_BOUNDS`, this.maxBufferSize * 2, renderCtx.DYNAMIC_DRAW, index, () => {
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
          this.buffers['QUAD'][`${key}_${index}`] = buffer;
          renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
          renderCtx.bufferData(renderCtx.ARRAY_BUFFER, size, drawType); // dummy size
    
          vertexBindFn()
      }
}

export default QuadProgram;