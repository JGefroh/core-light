const fragmentSourceCode = `#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_localPosition;
in vec2 v_instanceScale;
in vec4 v_scale;
out vec4 o_color;

void main() {
  float dist = length(v_localPosition);
  float edge = 0.49; // radius in normalized quad coords

  float pixelSize = fwidth(dist);
  float alpha = smoothstep(edge, edge - pixelSize, dist);

  if (dist >= edge) discard;
  
  vec3 premultiplied = v_color.rgb * (v_color.a * alpha);
  o_color = vec4(premultiplied, v_color.a * alpha);
}`;

export default fragmentSourceCode