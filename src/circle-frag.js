const circle_frag = /* glsl */`
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float u_width;
uniform float u_height;
uniform sampler2D u_texture;
uniform vec2 u_resolution_screen;
uniform float u_frameNum;
varying float x; // -0.5 to 0.5
varying float y; // -0.5 to 0.5

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {

    vec2 p_screen_norm = gl_FragCoord.xy / u_resolution_screen;
    vec2 p = vec2(x + 0.5, 
                  y + 0.5);

    /// Discard everything outside this distance from center to make a circle
    float distFromCenter = distance(p, vec2(0.5,0.5));
    float radius = 0.5;
    if(distFromCenter > radius) discard;

    /// Get the color of the pixels behind our shape by referencing the rtTex
    vec4 texCol = texture2D(u_texture, p_screen_norm);
    
    /// Set all the new colors
    vec3 black = vec3(0.0,0.0,0.0);
    vec3 neonGreen = vec3(0.75,1.0,0.0);
    vec3 red = vec3(1.0,0.0,0.0);
    if(texCol.rgb == black) {
        if(mod(u_frameNum,2.0) == 0.0) discard;
        texCol.rgb = neonGreen;
    }
    else texCol.rgb = red;

    gl_FragColor = vec4(texCol.x, texCol.y, 0.0,1.0);
}`;
export default circle_frag;