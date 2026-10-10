precision mediump float;

/** @resolution */
uniform vec2 u_resolution;

/**
 * @label Grain size
 * @range 0.5, 4
 * @default 1.2
 */
uniform float u_scale;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / u_scale);
  float n = hash(cell);
  gl_FragColor = vec4(vec3(n), 1.0);
}
