// Set high precision for accurate lighting calculations
precision highp float;

// Varying: coordinates received from the Vertex Shader
varying vec2 vUv;

// Uniforms: data passed from the JavaScript (main.js)
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// --- Utility Functions ---

// Simple noise function (for subtle inherent glass imperfections/distortion)
float hash(vec2 p) {
    p = fract(p * vec2(213.12, 345.24));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

// Perlin/Simplex-like noise (for smooth, 'liquid' movement)
vec2 noise(vec2 x, float time) {
    // Offset the noise by time to create continuous movement
    x *= 2.0;
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation

    float n = p.x + p.y * 57.0;

    // Sample the noise field multiple times
    return mix(
        mix(vec2(hash(n), hash(n + 1.0)), vec2(hash(n + 57.0), hash(n + 58.0)), f.x),
        mix(vec2(hash(n + 1.0), hash(n + 2.0)), vec2(hash(n + 58.0), hash(n + 59.0)), f.x),
        f.y
    ) * 2.0 - 1.0;
}


// --- Main Shader Logic ---
void main() {
    // 1. Get current normalized screen coordinate (0 to 1)
    vec2 uv = vUv;

    // 2. Calculate Distortion Vector (The "Liquid" part)
    // Scale up the coordinates to zoom into the noise field, and offset by time.
    vec2 distortionBase = noise(uv * 4.0, u_time * 0.2); 
    
    // Mix the base distortion with mouse interaction for a reactive element
    // This creates a circular ripple at the mouse position.
    vec2 mouseEffect = vec2(0.0);
    vec2 pMouse = (u_mouse * u_resolution.xy) / u_resolution.y; // Correct aspect ratio
    vec2 pUV = gl_FragCoord.xy / u_resolution.y; 
    float distToMouse = distance(pUV, pMouse);
    
    // Apply a sharp, dampening ripple effect around the cursor
    float ripple = smoothstep(0.3, 0.05, distToMouse);
    mouseEffect = normalize(pUV - pMouse) * ripple * 0.5;

    // Final distortion combines time, inherent noise, and mouse interaction
    vec2 distortion = (distortionBase * 0.02) + (mouseEffect * 0.15); 


    // 3. Apply the Distortion
    // Add the distortion vector to the base coordinates. 
    // This shifts the sampled color coordinate, simulating refraction.
    vec2 shiftedUV = uv + distortion;


    // 4. Calculate Frosted Glass Look (The "Glass" part)
    // Instead of complex texture sampling (which requires render targets), 
    // we simulate the blurred color by taking a few noisy samples around the shifted UV.
    
    // Base color sample (what the texture *would* look like at this shifted point)
    // Since we don't have a texture, we create a color based on the shifted UV.
    vec3 baseColor = vec3(shiftedUV.x, shiftedUV.y, 0.5 + sin(u_time * 0.5) * 0.2);

    // Add a simple blur simulation by averaging nearby samples
    vec3 blurredColor = baseColor * 0.5; // Start with half of the base
    float blurRadius = 0.005;

    // Sample 4 nearby points
    blurredColor += vec3(shiftedUV.x + blurRadius, shiftedUV.y, 0.5) * 0.125;
    blurredColor += vec3(shiftedUV.x - blurRadius, shiftedUV.y, 0.5) * 0.125;
    blurredColor += vec3(shiftedUV.x, shiftedUV.y + blurRadius, 0.5) * 0.125;
    blurredColor += vec3(shiftedUV.x, shiftedUV.y - blurRadius, 0.5) * 0.125;
    
    // Normalize and add some chromatic aberration simulation (R, G, B shift)
    // NOTE: In a real implementation, you would sample the BACKGROUND texture here!
    vec3 finalColor;
    finalColor.r = length(blurredColor.rgb + vec3(0.005, 0.0, 0.0)) * 0.5;
    finalColor.g = length(blurredColor.rgb + vec3(0.0, 0.0, 0.0)) * 0.5;
    finalColor.b = length(blurredColor.rgb + vec3(0.0, 0.0, 0.005)) * 0.5;
    
    // 5. Final Output
    gl_FragColor = vec4(finalColor, 0.85); // 0.85 alpha for translucency
}

