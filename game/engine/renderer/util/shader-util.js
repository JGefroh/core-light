export function compileShader(renderCtx, sourceCode, type) {
    const shader = renderCtx.createShader(type); // VERTEX_SHADER or FRAGMENT_SHADER
    renderCtx.shaderSource(shader, sourceCode);
    renderCtx.compileShader(shader);
    if (!renderCtx.getShaderParameter(shader, renderCtx.COMPILE_STATUS)) {
      throw new Error(renderCtx.getShaderInfoLog(shader));
    }
    return shader;
}