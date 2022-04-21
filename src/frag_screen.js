const frag_screen = /* glsl */`
varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {

    gl_FragColor = texture2D( tDiffuse, vUv );

}`;
export default frag_screen;