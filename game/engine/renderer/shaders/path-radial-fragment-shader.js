const shaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 v_worldPos;
    out vec4 o_color;

    uniform bool u_isCone;

    uniform vec2 u_center;
    uniform float u_radius;
    uniform int u_stopCount;
    uniform float u_stops[8];     // Max 8 stops
    uniform vec4 u_colors[8];

    // Feathering
    uniform float u_startAngleRadians;
    uniform float u_endAngleRadians;
    uniform float u_softnessRadians;
    
    void setColorForFullLight() {
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
    }

    void setColorForCone() {
        vec2 dir = v_worldPos - u_center;
        float dist = length(dir);
        float angle = atan(dir.y, dir.x);
        if (angle < 0.0) angle += 6.28318530718; // wrap [0, 2PI]

        float t_dist = clamp(dist / u_radius, 0.0, 1.0);

        // Angular soft mask
        float visibility = 1.0;

        if (u_startAngleRadians != u_endAngleRadians) {
            float TWO_PI = 6.2831853;
            float normStart = mod(u_startAngleRadians, TWO_PI);
            float normEnd = mod(u_endAngleRadians, TWO_PI);
            float normAngle = mod(angle, TWO_PI);

            float coneSpan = mod(normEnd - normStart + TWO_PI, TWO_PI);
            float mid = mod(normStart + coneSpan * 0.5, TWO_PI);

            float diff = abs(normAngle - mid);
            diff = min(diff, TWO_PI - diff);

            float edgeFalloff = smoothstep(coneSpan * 0.5 - u_softnessRadians, coneSpan * 0.5, diff);

            visibility = 1.0 - edgeFalloff;
        }

        vec4 baseColor = u_colors[0];
        for (int i = 0; i < u_stopCount - 1; ++i) {
            float left = u_stops[i];
            float right = u_stops[i + 1];
            if (t_dist >= left && t_dist <= right) {
                float f = (t_dist - left) / max((right - left), 0.0001);
                baseColor = mix(u_colors[i], u_colors[i + 1], f);
                break;
            }
        }

        if (t_dist > u_stops[u_stopCount - 1]) {
            baseColor = u_colors[u_stopCount - 1];
        }

        o_color = baseColor * visibility;
    }
    

    void main() {
        if (u_isCone) {
            setColorForCone();
        }
        else {
            setColorForFullLight();
        }
    }
    `;

export default shaderSourceCode