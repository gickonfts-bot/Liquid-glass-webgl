import * as THREE from 'three';
// Note: In a true GitHub project, you'd import THREE, but here 
// we assume the CDN import in index.html makes THREE globally available.

// 1. Scene Variables
let scene, camera, renderer, geometry, material, mesh;
const container = document.getElementById('webgl-container');
let uniforms;

// 2. Load Shaders (These paths point to the files we will create next)
const vertexShader = `
    // Vertex Shader code will be loaded here from 'shaders/vertex.glsl'
`;
const fragmentShader = `
    // Fragment Shader code will be loaded here from 'shaders/fragment.glsl'
`;

// Helper function to fetch the shader file content
async function loadShader(path) {
    const response = await fetch(path);
    return response.text();
}

// 3. Initialization Function
async function init() {
    // --- Setup Scene ---
    scene = new THREE.Scene();

    // --- Setup Camera ---
    // Orthographic Camera is often easier for 2D screen-filling effects
    camera = new THREE.OrthographicCamera(
        -1, // Left
        1,  // Right
        1,  // Top
        -1, // Bottom
        0.1, // Near
        1000 // Far
    );
    camera.position.z = 1;

    // --- Setup Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Load Shaders from files ---
    const vsSource = await loadShader('./shaders/vertex.glsl');
    const fsSource = await loadShader('./shaders/fragment.glsl');
    
    // --- Define Uniforms ---
    // Uniforms are variables passed from JavaScript to the shaders.
    uniforms = {
        u_time: { type: 'f', value: 0.0 }, // Time for animation
        u_resolution: { type: 'v2', value: new THREE.Vector2() }, // Screen size
        u_mouse: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) } // Mouse position
    };
    
    // --- Create Material using Custom Shaders ---
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vsSource,
        fragmentShader: fsSource,
    });
    
    // --- Create Geometry (A simple plane that covers the screen) ---
    geometry = new THREE.PlaneGeometry(2, 2); 
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Event Listeners ---
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove, false);

    // Initial size update
    onWindowResize(); 

    // Start the render loop
    animate();
}

// 4. Handle Window Resize
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.u_resolution.value.x = window.innerWidth;
    uniforms.u_resolution.value.y = window.innerHeight;
}

// 5. Handle Mouse Movement (Crucial for interactive liquid distortion)
function onMouseMove(event) {
    // Normalize mouse position to (0 to 1)
    uniforms.u_mouse.value.x = event.clientX / window.innerWidth;
    uniforms.u_mouse.value.y = 1.0 - (event.clientY / window.innerHeight); // Flip Y-axis for WebGL
}

// 6. The Animation Loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    // Update time uniform for continuous animation in the shader
    uniforms.u_time.value = clock.getElapsedTime();

    renderer.render(scene, camera);
}

// Start the application
init();

