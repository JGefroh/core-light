const shaderSourceCode = `#version 300 es
      layout(location = 0) in vec2 a_position;
      in vec2 a_instanceOffset;
      in vec4 a_instanceColor;
      in vec2 a_instanceScale;
      in float a_instanceAngleDegrees;
      in float a_instanceBorderSize;
      in vec4 a_instanceBorderColor;
      in vec4 a_instanceTextureUvBounds;
      
      out vec4 v_color;
      out vec2 v_localPosition;
      out float v_borderSize;
      out vec4 v_borderColor;
      out vec2 v_instanceScale;
      out vec2 v_texCoord;

      uniform mat4 u_projectionMatrix;

      void main() {
        float angleRadians = radians(a_instanceAngleDegrees);
        float c = cos(angleRadians);
        float s = sin(angleRadians);
        
        vec2 scaled = a_position * a_instanceScale;

        vec2 rotated = vec2(
          scaled.x * c - scaled.y * s,
          scaled.x * s + scaled.y * c
        );

        vec2 worldPosition = rotated + a_instanceOffset;

        gl_Position = u_projectionMatrix * vec4(worldPosition, 0.0, 1.0);
        v_color = a_instanceColor;
        v_localPosition = a_position;

        v_borderSize = a_instanceBorderSize;
        v_borderColor = a_instanceBorderColor;
        v_instanceScale = a_instanceScale;
        vec2 localUV = a_position + vec2(0.5);
        v_texCoord = mix(a_instanceTextureUvBounds.xy, a_instanceTextureUvBounds.zw, localUV);
      }`;
export default shaderSourceCode