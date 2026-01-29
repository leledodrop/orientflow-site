
// Remove previous container if it exists (for hot reload support)
const oldContainer = document.getElementById('canvas-container');
if (oldContainer) {
    oldContainer.remove();
}

const container = document.createElement('div');
container.id = 'canvas-container';
document.body.prepend(container);

// Scene Setup
const scene = new THREE.Scene();
/* Fog for depth fading - matches background color */
scene.fog = new THREE.FogExp2(0x050508, 0.001); // Matching deep dark blue/black

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
container.appendChild(renderer.domElement);

// Particles (Stars)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 4500; // Optimized for mobile performance

const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

const color1 = new THREE.Color('#ffffff'); // White
const color2 = new THREE.Color('#00f0ff'); // Cyan
const color3 = new THREE.Color('#7000ff'); // Purple

for (let i = 0; i < particlesCount * 3; i += 3) {
    // Spread them out in a large distinct volume
    posArray[i] = (Math.random() - 0.5) * 25; // x
    posArray[i + 1] = (Math.random() - 0.5) * 40; // y (Tall field)
    posArray[i + 2] = (Math.random() - 0.5) * 20; // z

    // Random colors from the palette
    const colorChoice = Math.random();

    if (colorChoice > 0.6) {
        colorsArray[i] = 1.0;   // R (White)
        colorsArray[i + 1] = 1.0; // G
        colorsArray[i + 2] = 1.0; // B
    } else if (colorChoice > 0.3) {
        colorsArray[i] = 0.0;   // R (Cyan)
        colorsArray[i + 1] = 0.94; // G
        colorsArray[i + 2] = 1.0; // B
    } else {
        colorsArray[i] = 0.44;  // R (Purple)
        colorsArray[i + 1] = 0.0; // G
        colorsArray[i + 2] = 1.0; // B
    }
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.012, // Fine gentle stars
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
});

// Mesh
const starsMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(starsMesh);

camera.position.z = 2;

// Smooth State Variables (Lerp)
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

let scrollY = 0;
let targetScrollY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// Listeners
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

// Resize Optimization
let currentWidth = window.innerWidth;
window.addEventListener('resize', () => {
    // Only resize if width changes (e.g. rotation) to avoid address-bar jank on mobile
    if (window.innerWidth !== currentWidth) {
        currentWidth = window.innerWidth;
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    // Smooth Mouse Interaction (Lerp 0.05)
    targetX = mouseX * 0.0005; // Less sensitivity
    targetY = mouseY * 0.0005;

    // Gentle rotation based on mouse
    starsMesh.rotation.y += 0.02 * (targetX - starsMesh.rotation.y);
    starsMesh.rotation.x += 0.02 * (targetY - starsMesh.rotation.x);

    // Smooth Scroll Interaction (Vertical Motion only)
    targetScrollY = scrollY * 0.0015; // Adjustment factor for speed

    // We move the camera Y position to simulate traveling through the stars vertically
    // Lerp camera.position.y to match scroll
    // current + factor * (target - current)
    camera.position.y += 0.08 * (-targetScrollY - camera.position.y);

    // Constant tiny drift for 'alive' feeling
    starsMesh.rotation.z += 0.0002;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
