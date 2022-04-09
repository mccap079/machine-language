const green_vert = /* glsl */`
varying vec2 vUv;
uniform float u_width;
uniform float u_height;
varying float x;
varying float y;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    x = position.x / u_width;
    y = position.y / u_height;
}`;
export default green_vert;