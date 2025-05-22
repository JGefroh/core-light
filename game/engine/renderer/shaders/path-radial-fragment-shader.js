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
        float angularVisibility = 1.0;
        const float FULL_CIRCLE_RADIANS = 6.2831853;

        vec2 lightToFragment = v_worldPos - u_center; // light to fragment
        float fragmentDistanceFromCenter = length(lightToFragment);
        float normalizedRadialDistance = clamp(fragmentDistanceFromCenter / u_radius, 0.0, 1.0);
        float fragmentAngle = atan(lightToFragment.y, lightToFragment.x);

        if (fragmentAngle < 0.0) fragmentAngle += 6.2831853; // Wrap to [0, 2π]


        // Apply angular falloff only for non-full-circle lights (cones)
        if (u_startAngleRadians != u_endAngleRadians) {
            float normalizedStartAngle = mod(u_startAngleRadians, FULL_CIRCLE_RADIANS);
            float normalizedEndAngle   = mod(u_endAngleRadians, FULL_CIRCLE_RADIANS);
            float angularSpan = mod(normalizedEndAngle - normalizedStartAngle + FULL_CIRCLE_RADIANS, FULL_CIRCLE_RADIANS);
            float coneCenterAngle = mod(normalizedStartAngle + angularSpan * 0.5, FULL_CIRCLE_RADIANS);
            float angleDifference = abs(fragmentAngle - coneCenterAngle);

            angleDifference = min(angleDifference, FULL_CIRCLE_RADIANS - angleDifference);

            float fadeStart = angularSpan * 0.5 - u_softnessRadians;
            float fadeEnd   = angularSpan * 0.5;
            float edgeFade = smoothstep(fadeStart, fadeEnd, angleDifference);

            angularVisibility = 1.0 - edgeFade;
        }

        vec4 finalColor = u_colors[0];

        for (int stopIndex = 0; stopIndex < u_stopCount - 1; ++stopIndex) {
            float stopStart = u_stops[stopIndex];
            float stopEnd   = u_stops[stopIndex + 1];

            if (normalizedRadialDistance >= stopStart && normalizedRadialDistance <= stopEnd) {
                float segmentFraction = (normalizedRadialDistance - stopStart) / max(stopEnd - stopStart, 0.0001);
                finalColor = mix(u_colors[stopIndex], u_colors[stopIndex + 1], segmentFraction);
                break;
            }
        }

        if (normalizedRadialDistance > u_stops[u_stopCount - 1]) {
            finalColor = u_colors[u_stopCount - 1];
        }

        o_color = finalColor * angularVisibility;
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