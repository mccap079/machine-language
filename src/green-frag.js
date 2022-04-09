const green_frag = /* glsl */`
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float u_time;
uniform float u_width;
uniform float u_height;
varying float x; // -0.5 to 0.5
varying float y; // -0.5 to 0.5

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// Version 3 - https://stackoverflow.com/a/10625698/1757149
float random( vec2 p )
{
    vec2 K1 = vec2(
        23.14069263277926, // e^pi (Gelfond's constant)
         2.665144142690225 // 2^sqrt(2) (Gelfondâ€“Schneider constant)
    );
    return fract( cos( dot(p,K1) ) * 12345.6789 );
}

void main() {

    vec2 p_screen = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
    
    // if (mod(p_screen.x, 4.0) != 0.0){ discard;

    float x_normal = x + 0.5;
    float y_normal = y + 0.5;

    vec2 p = vec2(floor(x_normal * u_width), 
                  floor(y_normal * u_height));
    
    // if(p.x > 0.5) discard;

    float perc = mod(u_time * 3.0, u_width);
    float rand = 1.0;
    float randSpread = 0.0;

    vec4 c = vec4(p.x, 0.0, 0.0, 1.0);

    gl_FragColor = c;
}`;
export default green_frag;