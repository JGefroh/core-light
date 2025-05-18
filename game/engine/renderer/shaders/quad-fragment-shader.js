const fragmentSourceCode = `#version 300 es
  precision mediump float;

  in vec4 v_color;
  in vec2 v_localPosition;
  in float v_borderSize;
  in vec4 v_borderColor;
  in vec2 v_instanceScale;
  in vec4 v_scale;

  // Textures
  in vec2 v_texCoord;
  uniform sampler2D u_texture0;


  out vec4 o_color;

    
  float random(vec2 uv) {
    return fract(sin(dot(uv ,vec2(12.9898, 78.233))) * 43758.5453);
  } 
    
  void main() {
    bool hasTexture = any(greaterThan(v_texCoord, vec2(0.001)));

    if (hasTexture) {
      // Sample the texture only, no extra effects
      o_color = texture(u_texture0, v_texCoord);
    } else {
      // Normalize localPosition from [-0.5, 0.5] to [0.0, 1.0]
      vec2 uv = v_localPosition + vec2(0.5);
      vec2 edgeDist = min(uv, 1.0 - uv);

      float relativeBorderX = v_borderSize / v_instanceScale.x;
      float relativeBorderY = v_borderSize / v_instanceScale.y;
      bool isBorder = (edgeDist.x < relativeBorderX) || (edgeDist.y < relativeBorderY);

      if (isBorder) {
        o_color = v_borderColor;
      } else {
        float noise = random(uv * 32.0);
        vec3 noisyColor = v_color.rgb * (0.9 + 0.2 * noise);
        o_color = vec4(noisyColor, v_color.a);
      }
    }
  }
  `;

export default fragmentSourceCode