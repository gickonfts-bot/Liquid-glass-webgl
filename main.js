// ... (omitting shared setup functions and declarations)
import * as THREE from 'three'; 

let scene, camera, renderer, geometry, material, mesh;
const container = document.getElementById('webgl-container');
const buttonWrapper = document.getElementById('liquid-button-wrapper'); // NEW: Get the wrapper
let uniforms;

// Helper function to fetch the shader file content (assuming it's still in main.js)
async function loadShader(path) {
    const response = await fetch(path);
    return response.text();
}

// 3. Initialization Function
async function init() {
    // --- Setup Scene ---
    scene = new THREE.Scene();

    // --- Setup Camera (Orthographic) ---
    // We adjust the camera to match the button's aspect ratio (200x60 = 3.33:1)
    const aspect = buttonWrapper.offsetWidth / buttonWrapper.offsetHeight; 
    
    camera = new THREE.OrthographicCamera(
        -aspect, // Left
        aspect,  // Right
        1,       // Top
        -1,      // Bottom
        0.1,     // Near
        1000     // Far
    );
    camera.position.z = 1;

    // --- Setup Renderer ---
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // NEW: Set size to match the button wrapper size
    renderer.setSize(buttonWrapper.offsetWidth, buttonWrapper.offsetHeight); 
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // --- Load Shaders (as before) ---
    const vsSource = await loadShader('./shaders/vertex.glsl');
    const fsSource = await loadShader('./shaders/fragment.glsl');
    
    // --- Define Uniforms (as before) ---
    uniforms = {
        u_time: { type: 'f', value: 0.0 }, 
        // NEW: Initial resolution is the button's size
        u_resolution: { type: 'v2', value: new THREE.Vector2(buttonWrapper.offsetWidth, buttonWrapper.offsetHeight) }, 
        u_mouse: { type: 'v2', value: new THREE.Vector2(0.5, 0.5) }
    };
    
    // --- Create Material and Mesh (as before) ---
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vsSource,
        fragmentShader: fsSource,
        transparent: true // Ensure the alpha channel works for the rounded button edges
    });
    
    geometry = new THREE.PlaneGeometry(2 * aspect, 2); // Adjust plane to camera aspect
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Event Listeners ---
    // NEW: Listen for mouse events on the button wrapper only
    buttonWrapper.addEventListener('mousemove', onMouseMove, false); 
    // We don't need a window resize listener if the button is fixed size.

    // Start the render loop
    animate();
}

// 4. Handle Mouse Movement (Crucial for interactive liquid distortion)
function onMouseMove(event) {
    // NEW: Normalize mouse position relative to the button's bounding box
    const rect = buttonWrapper.getBoundingClientRect();
    uniforms.u_mouse.value.x = (event.clientX - rect.left) / rect.width;
    uniforms.u_mouse.value.y = 1.0 - ((event.clientY - rect.top) / rect.height); // Flip Y-axis for WebGL
}

// 5. The Animation Loop (Same as before)
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}

// Start the application
init();
