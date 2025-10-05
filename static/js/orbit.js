import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
import { OrbitControls } from './orbitcontrols.js';
import { CSS2DRenderer, CSS2DObject } from "./CSS2DRenderer.js";
//import * as THREE from 'three'

const scale = 150000000/100;

export let asteroids = [];
export let earthData = [];

export let colors = [0xff0000, 0x3cb371, 0x0000ff];

export function updateOrbitData(recv) {
    console.log("Data recived: ");
    console.log(recv);

    let data = recv[0];
    
    for (let i = 0; i < Object.keys(data).length; i++) {
        let l = [];
        let orbit, curve, cube;
        let colorUse;

        colorUse = colors[i];
        if (i >= colors.length) {colorUse = colors[i%colors.length]}

        ({ orbit, curve, cube } = addOrbit(
            data[i].semi_major_axis/scale,
            data[i].semi_minor_axis/scale,
            data[i].x_coordinate/scale,
            data[i].y_coordinate/scale,
            data[i],
            colorUse
        ));

        orbit = rotateOrbit(orbit, data[i]);
        l.push(data[i], orbit, curve, cube);
        asteroids.push(l);
        scene.add(orbit);
        console.log(scene);
    }

    earthData.push(recv[1][0]);
    let earthOrbit, earthCurve, earthCube;
    

    ({ orbit: earthOrbit, curve: earthCurve, cube: earthCube} = addEarth(
        recv[1][0].semi_major_axis/scale,
        recv[1][0].semi_minor_axis/scale,
        recv[1][0].xpos/scale,
        recv[1][0].ypos/scale,
        recv[1][0],
        0xffffff
    ));

    earthOrbit = rotateOrbit(earthOrbit, earthData[0]);
    earthData.push(earthOrbit, earthCurve, earthCube);
    scene.add(earthOrbit);
}

const scene = new THREE.Scene();
const backTexture = new THREE.TextureLoader().load('static/space.jpg');
scene.background = backTexture;

const coordinateSystem = new THREE.Matrix4();
coordinateSystem.makeRotationX(Math.PI / 2); 

scene.applyMatrix4(coordinateSystem);

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

const camera = new THREE.PerspectiveCamera(90, window.innerWidth/window.innerHeight, 0.001, 10000);

camera.position.set(10, 0, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("three_container").appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 0, 0);

// Adjust these settings after creating controls
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.zoomSpeed = 0.5;  // Reduce from default 1.0 for smoother zoom
controls.minDistance = 5;   // Set minimum zoom distance
controls.maxDistance = 500; // Set maximum zoom distance
controls.screenSpacePanning = true; // Makes panning more consistent
controls.enablePan = true;

// Optional: Add smooth zoom
controls.smoothZoom = true;
controls.smoothZoomSpeed = 5;

const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaa00, 10);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

const pointHelper = new THREE.PointLightHelper(pointLight);
//scene.add(pointHelper);

const grid = new THREE.GridHelper(300, 30, 0xffffff, 0x888888);
grid.position.y = 0;
scene.add(grid);

function addOrbit(xRad, yRad, x, y, asteroid, color) {
    const curve = new THREE.EllipseCurve(
        -asteroid.offset_vector/scale, 0,
        xRad, yRad,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(100)
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const ellipse = new THREE.Line(geometry, material);

    const asteroid_radius = (asteroid.estimated_diameter_max + asteroid.estimated_diameter_min) / 2 / scale * 15000000
    const cube = new THREE.Mesh(
        new THREE.SphereGeometry(asteroid_radius, 32, 32),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('static/asteroid.png')})
    );

    console.log(x, y);

    cube.position.set(x + -asteroid.offset_vector/scale, y, 0);

    const infoDiv = document.createElement('div');
    infoDiv.classname = 'info';

    const nameLabel = document.createElement('div');
    nameLabel.textContent = `Asteroid ${asteroid.name}`;
    nameLabel.className = 'name-label';

    const idLabel = document.createElement('div');
    idLabel.textContent = `ID: ${asteroid.id}`;
    idLabel.className = 'id-label';

    infoDiv.appendChild(nameLabel);
    infoDiv.appendChild(idLabel);

    const labelObj = new CSS2DObject(infoDiv);
    labelObj.position.set(-3, 3, 0)
    cube.add(labelObj);

    const orbit = new THREE.Object3D();
    orbit.add(ellipse);
    orbit.add(cube);

    return { orbit, curve, cube };
}

function addEarth(xRad, yRad, x, y, asteroid, color) {
    const curve = new THREE.EllipseCurve(
        -asteroid.offset_vector/scale, 0,
        xRad, yRad,
        0, 2 * Math.PI,
        false,
        0
    );

    const points = curve.getPoints(100)
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color });
    const ellipse = new THREE.Line(geometry, material);

    const cube = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('static/earth.jpg')})
    );

    console.log(x, y);

    cube.position.set(x + -asteroid.offset_vector/scale, y, 0);

    const infoDiv = document.createElement('div');
    infoDiv.classname = 'info';

    const nameLabel = document.createElement('div');
    nameLabel.textContent = `Earth`;
    nameLabel.className = 'name-label';

    infoDiv.appendChild(nameLabel);

    const labelObj = new CSS2DObject(infoDiv);
    labelObj.position.set(-3, 3, 0)
    cube.add(labelObj);

    const orbit = new THREE.Object3D();
    orbit.add(ellipse);
    orbit.add(cube);

    return { orbit, curve, cube };
}

function rotateOrbit(orbit, asteroid) {
    orbit.position.set(0, 0, 0);
    orbit.rotation.set(0, 0, 0);
    orbit.rotateX(Math.PI/2);

    orbit.rotateZ(-asteroid.ascending_node_longitude);
    orbit.rotateX(-asteroid.inclination);
    orbit.rotateZ(-asteroid.perihelion_argument);

    //orbit.rotateX(-Math.PI / 2);

    orbit.updateMatrixWorld(true);

    return orbit;
}

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(3, 32, 32),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('static/2k_sun.jpg')})
);

sun.position.set(0, 0, 0);
scene.add(sun);

//earth.position.set(-150000000/scale, 0, 0);
//scene.add(earth);


export let animationId;
export let isAnimating = true;

let time = 0;
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const raycaster = new THREE.Raycaster();
raycaster.far = 10000;
raycaster.params.Points.threshold = 10;
raycaster.near = 0.1;
const mouse = new THREE.Vector2();

window.addEventListener("click", onClick, false)

export let selectedAsteroid = null;

const nameEntry = document.getElementById("name");
const idEntry = document.getElementById("id");
const speedEntry = document.getElementById("speed");
const diameterEntry = document.getElementById("diameter");

const asteroidInfo = document.getElementById("asteroid-info");
const impactMap = document.getElementById("impact-map");

export let clicked = null;

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const testObj = asteroids.map(asteroid => asteroid[1]).flat()
    testObj.push(sun, grid);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(testObj, true);

    if (intersects.length > 0) {
        clicked = intersects[0].object;
        console.log(clicked.parent);

        const asteroidList = asteroids.find(ast => 
            ast[1] === clicked.parent ||
            ast[1].children.some(child => child === clicked.parent)
        );

        if (asteroidList) {
            asteroidInfo.style.display = 'block';
            selectedAsteroid = asteroidList[0];
            console.log(selectedAsteroid);
            nameEntry.innerHTML = "Name: " + selectedAsteroid.name;
            idEntry.innerHTML = "ID: " + selectedAsteroid.id;
            speedEntry.innerHTML = "Speed (Relative to Earth, km/s): " + selectedAsteroid.relative_velocity_earth;
            diameterEntry.innerHTML = "Diameter (km): " + (selectedAsteroid.estimated_diameter_max + selectedAsteroid.estimated_diameter_min) / 2;
        } else {
            asteroidInfo.style.display = 'none';
        }
    }
}

const myButton = document.getElementById('simulate');
const angle_input = document.getElementById("impact-angle");

export let impactRadius = 1;
export let impactForce = 1;

// Add a click event listener
myButton.addEventListener('click', function() {
    console.log('Button clicked!');
    console.log('Sending values:', {
        id: selectedAsteroid.id,
        rad_min: selectedAsteroid.estimated_diameter_min/2,
        rad_max: selectedAsteroid.estimated_diameter_max/2,
        speed: selectedAsteroid.relative_velocity_earth,
        angle: THREE.MathUtils.degToRad(angle_input.value)
    });
    fetch(`/simulate?id=${selectedAsteroid.id}&rad_min=${selectedAsteroid.estimated_diameter_min/2}&rad_max=${selectedAsteroid.estimated_diameter_max/2}&speed=${selectedAsteroid.relative_velocity_earth}&angle=${THREE.MathUtils.degToRad(angle_input.value)}`)
    .then(resp => resp.json())
    .then(data => {
        impactRadius = data[0][0];
        impactForce = data[0][1];

        document.getElementById("iRadius").innerHTML = `Impact radius (km): ${impactRadius}`;
        document.getElementById("iArea").innerHTML = `Impact area (km squared): ${(impactRadius*impactRadius) * Math.PI}`;
        document.getElementById("iEnergy").innerHTML = `Impact energy:: ${impactForce}`;
        document.getElementById("state").innerHTML = "Simulation completed!"
    })
    .catch(err => {
        console.log(err);
        document.getElementById("state").innerHTML = "Simulation failed."
    });
});

export function animate() {
    animationId = requestAnimationFrame(animate);
    if (!isAnimating) return;
    asteroids.forEach(element => {
        if (!element[2]) return;
    });

    time += 0.001;
    if (time > 1) time = 0;

    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

export function stopAnimation() {
    isAnimating = false;
    cancelAnimationFrame(animationId);
}

export function startAnimation() {
    if (!isAnimating) {
        isAnimating = true;
        animate();
    }
}

animate();
