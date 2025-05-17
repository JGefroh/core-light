const shaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 v_worldPos;
    out vec4 o_color;

    uniform vec2 u_center;
    uniform float u_radius;
    uniform int u_stopCount;
    uniform float u_stops[8];     // Max 8 stops
    uniform vec4 u_colors[8];

    void main() {
        float dist = distance(v_worldPos, u_center);
        float t = clamp((dist / u_radius), 0.0, 1.0);


        vec4 color = u_colors[0]; // default to first stop

        for (int i = 0; i < u_stopCount - 1; ++i) {
            float left = u_stops[i];
            float right = u_stops[i + 1];

            if (t >= left && t <= right) {
                float f = (t - left) / max((right - left), 0.0001);
                color = mix(u_colors[i], u_colors[i + 1], f);
                break;
            }
        }

        // fallback in case t > last stop
        if (t > u_stops[u_stopCount - 1]) {
            color = u_colors[u_stopCount - 1];
        }

        o_color = color;
    }`;
export default shaderSourceCode