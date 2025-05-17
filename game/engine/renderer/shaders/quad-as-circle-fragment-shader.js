const fragmentSourceCode = `#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_localPosition;
in float v_borderSize;
in vec4 v_borderColor;
in vec2 v_instanceScale;
out vec4 o_color;

void main() {
  float dist = length(v_localPosition);
  float edge = 0.49; // radius of the circle in normalized quad coords

  float pixelSize = fwidth(dist);

  float borderOuter = edge;
  float borderInner = edge - (v_borderSize / max(v_instanceScale.x, v_instanceScale.y));

  if (dist >= borderOuter) {
    discard; // Outside the circle
  }
  else if (dist >= borderInner) {
    // Inside the border ring
    o_color = v_borderColor;
  }
  else {
    // Inside the circle body
    float alpha = smoothstep(borderInner, borderInner - pixelSize, dist);
    vec3 premultiplied = v_color.rgb * (v_color.a * alpha);
    o_color = vec4(premultiplied, v_color.a * alpha);
  }
}`;

export default fragmentSourceCode