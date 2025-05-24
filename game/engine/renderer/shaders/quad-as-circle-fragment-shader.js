const fragmentSourceCode = `#version 300 es
precision mediump float;

in vec4 v_color;
in vec2 v_localPosition;
in float v_borderSize;
in vec4 v_borderColor;
in vec2 v_instanceScale;
in vec2 v_texCoord;

uniform sampler2D u_texture0;

out vec4 o_color;

float random(vec2 uv) {
  return fract(sin(dot(uv ,vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float dist = length(v_localPosition);
  float edge = 0.49;
  float pixelSize = fwidth(dist);

  float borderOuter = edge;
  float borderInner = edge - (v_borderSize / max(v_instanceScale.x, v_instanceScale.y));

  if (dist >= borderOuter) {
    discard;
  }

  bool hasTexture = any(greaterThan(v_texCoord, vec2(0.001)));
  vec4 baseColor;

  if (hasTexture) {
    baseColor = texture(u_texture0, v_texCoord);
  } else {
    vec2 uv = v_localPosition + vec2(0.5);
    float noise = random(uv * 32.0);
    vec3 noisyColor = v_color.rgb * (0.9 + 0.2 * noise);
    baseColor = vec4(noisyColor, v_color.a);
  }

  if (dist >= borderInner) {
    o_color = v_borderColor;
  } else {
    float alpha = smoothstep(borderInner, borderInner - pixelSize, dist);
    vec3 premultiplied = baseColor.rgb * (baseColor.a * alpha);
    o_color = vec4(premultiplied, baseColor.a * alpha);
  }
}`;

export default fragmentSourceCode