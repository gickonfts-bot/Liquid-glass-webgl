// Define the precision for floating-point numbers
precision highp float;

// Attributes received from Three.js Geometry (our 2x2 Plane)
attribute vec3 position;
attribute vec2 uv; // Texture coordinates

// Varying variables (passed from Vertex Shader to Fragment Shader)
// 'vUv' will carry the normalized UV coordinates to the fragment stage.
varying vec2 vUv;

void main() {
    // 1. Pass the UV coordinates to the fragment shader
    vUv = uv;

    // 2. Pass the vertex position to the GPU clip space
    // The matrix multiplications (projectionMatrix * modelViewMatrix) 
    // transform the 3D position into a final 2D screen coordinate.
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

