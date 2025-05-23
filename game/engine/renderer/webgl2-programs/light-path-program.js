
import { default as pathRadialFragmentShaderSourceCode } from '@game/engine/renderer/shaders/path-radial-fragment-shader';
import { default as pathVertexShaderSourceCode } from '@game/engine/renderer/shaders/path-vertex-shader';

import { compileShader } from '@game/engine/renderer/util/shader-util';

class LightPathProgram {
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
        return this.vertexArrayObjects['LIGHT_PATH'];
    }

    getBuffers() {
        return this.buffers['LIGHT_PATH'];
    }

    _initializeProgram(renderCtx) {
        const program = renderCtx.createProgram();
    
        const vertexShader = compileShader(renderCtx, pathVertexShaderSourceCode, renderCtx.VERTEX_SHADER);
        renderCtx.attachShader(program, vertexShader);
    
        const fragmentShader = compileShader(renderCtx, pathRadialFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER);
        renderCtx.attachShader(program, fragmentShader);
    
        renderCtx.linkProgram(program);
    
        this.program = {
          program: program,
          attributes: {
            a_position: renderCtx.getAttribLocation(program, 'a_position'),
          },
          uniforms: {
            u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
            u_center: renderCtx.getUniformLocation(program, 'u_center'),
            u_radius: renderCtx.getUniformLocation(program, 'u_radius'),
            u_stopCount: renderCtx.getUniformLocation(program, 'u_stopCount'),
            u_stops: renderCtx.getUniformLocation(program, 'u_stops'),
            u_colors: renderCtx.getUniformLocation(program, 'u_colors'),
            u_isCone: renderCtx.getUniformLocation(program, 'u_isCone'), 
            u_startAngleRadians: renderCtx.getUniformLocation(program, 'u_startAngleRadians'),
            u_endAngleRadians: renderCtx.getUniformLocation(program, 'u_endAngleRadians'),
            u_softnessRadians: renderCtx.getUniformLocation(program, 'u_softnessRadians'),
          }
        };
    }

    _initializeBuffers(renderCtx) {
        const vao = renderCtx.createVertexArray();
        renderCtx.bindVertexArray(vao);
        this.vertexArrayObjects['LIGHT_PATH'] = vao;
    
        // Shader program for radial fill
        const program = this.program;
        renderCtx.useProgram(program.program);
    
        // Create and upload vertex buffer
        const buffer = this.buffers['LIGHT_PATH'] ||= renderCtx.createBuffer();
        renderCtx.bindBuffer(renderCtx.ARRAY_BUFFER, buffer);
        renderCtx.bufferData(renderCtx.ARRAY_BUFFER, this.maxBufferSize, renderCtx.STATIC_DRAW);
    
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

export default LightPathProgram;