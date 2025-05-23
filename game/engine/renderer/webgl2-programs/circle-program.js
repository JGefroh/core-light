
import { default as quadAsCircleFragmentShaderSourceCode } from '@game/engine/renderer/shaders/quad-as-circle-fragment-shader';
import { default as quadVertexShaderSourceCode } from '@game/engine/renderer/shaders/quad-vertex-shader';

import { compileShader } from '@game/engine/renderer/util/shader-util';
import QuadProgram from './quad-program';

class CircleProgram extends QuadProgram {
    _initializeProgram(renderCtx) {
        const program = renderCtx.createProgram();

        let quadVertexShader = compileShader(renderCtx, quadVertexShaderSourceCode, renderCtx.VERTEX_SHADER)
        renderCtx.attachShader(program, quadVertexShader);

        let quadAsCircleFragmentShader = compileShader(renderCtx, quadAsCircleFragmentShaderSourceCode, renderCtx.FRAGMENT_SHADER)
        renderCtx.attachShader(program, quadAsCircleFragmentShader);

        renderCtx.linkProgram(program);

        this.program = {
            program: program,
            attributes: {},
            uniforms: {
                u_projectionMatrix: renderCtx.getUniformLocation(program, 'u_projectionMatrix'),
            }
        }
    }
}

export default CircleProgram;
