const fragmentSourceCode = `#version 300 es
  precision mediump float;

  in vec4 v_color;
  in vec2 v_localPosition;
  in float v_borderSize;
  in vec4 v_borderColor;
  in vec2 v_instanceScale;
  in vec4 v_scale;

  out vec4 o_color;

    
  float random(vec2 uv) {
    return fract(sin(dot(uv ,vec2(12.9898, 78.233))) * 43758.5453);
  } 
    
  void main() {
    // Normalize localPosition from [-0.5, 0.5] to [0.0, 1.0]
    vec2 uv = v_localPosition + vec2(0.5);

    // Compute how close this fragment is to the nearest edge
    vec2 edgeDist = min(uv, 1.0 - uv);

    // Border condition: is this pixel inside the border band?
    // Size of border in UV units
    float relativeBorderX = v_borderSize / v_instanceScale.x;
    float relativeBorderY = v_borderSize / v_instanceScale.y;

    // Border test
    bool isBorder = (edgeDist.x < relativeBorderX) || (edgeDist.y < relativeBorderY);

    // Mix border color and fill color
    if (isBorder) {
      o_color = v_borderColor;
    }
    else {
      float noise = random(uv * 32.0); // controls frequency

      vec3 baseColor = v_color.rgb;
      vec3 noisyColor = baseColor * (0.9 + 0.2 * noise); // subtle variation

      o_color = vec4(noisyColor, v_color.a);
    }
  }
  `;

export default fragmentSourceCode