/**
 * WebGL / Shader Capability Guard
 * Safely verifies WebGL context availability in headless testing / SSR environments
 * to prevent shader initialization crashes or browser console warnings.
 */
export function isWebGLAvailable(): boolean {
  try {
    if (typeof window === "undefined" || !window.WebGLRenderingContext) {
      return false;
    }
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl && gl instanceof WebGLRenderingContext);
  } catch (e) {
    return false;
  }
}

export function safeInitWebGL(callback: () => void, fallback?: () => void): void {
  if (isWebGLAvailable()) {
    try {
      callback();
    } catch (err) {
      console.warn("[WebGLGuard] Shader or renderer initialization caught gracefully:", err);
      fallback?.();
    }
  } else {
    fallback?.();
  }
}
