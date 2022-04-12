const green_frag = /* glsl */`
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform float u_time;
uniform float u_width;
uniform float u_height;
uniform sampler2D u_texture;
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

//https://thebookofshaders.com/07/
float circle(in vec2 _p, in float _radius){
    vec2 dist = _p-vec2(0.5);
	return 1.0 - smoothstep(_radius-(_radius*0.01),
                            _radius+(_radius*0.01),
                            dot(dist,dist)*4.0);
}

void main() {

    vec2 p_screen = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
    
    // if (mod(p_screen.x, 4.0) != 0.0){ discard;

    vec2 p = vec2(x + 0.5, 
                  y + 0.5);
    
    //if(p.x > 0.5) discard;

    float perc = mod(u_time * 3.0, u_width);
    float rand = 1.0;
    float randSpread = 0.0;

    float distFromCenter = distance(p, vec2(0.5,0.5));
    float radius = 0.5;
    //if(distFromCenter > radius) discard;

    vec4 texCol = texture2D(u_texture, vUv);

    //vec4 c = vec4(0.0,0.0,0.0, 1.0);

    ///Discard everything outside the
    // if(distance(p,vec2(0.5)) < 0.5) c.r = 1.0;
    // else discard;
    gl_FragColor = texCol;
}`;
export default green_frag;