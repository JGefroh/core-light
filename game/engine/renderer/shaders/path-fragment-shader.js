const fragmentSourceCode = `#version 300 es
precision mediump float;

in vec2 v_worldPos;
out vec4 o_color;

uniform vec4 u_color;

void main() {
  o_color = u_color;
}
  `;

export default fragmentSourceCode