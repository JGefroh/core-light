const shaderSourceCode = `#version 300 es
    precision mediump float;
    in vec2 a_position;
    uniform mat4 u_projectionMatrix;
    out vec2 v_worldPos;

    void main() {
    v_worldPos = a_position;
    gl_Position = u_projectionMatrix * vec4(a_position, 0.0, 1.0);
    }`;
export default shaderSourceCode