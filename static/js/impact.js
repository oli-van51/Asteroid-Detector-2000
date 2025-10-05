import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"
import { OrbitControls } from "./orbitcontrols.js";
//import * as THREE from 'three'

const scene = new THREE.Scene();
const backTexture = new THREE.TextureLoader().load('static/space.jpg');
scene.background = backTexture;

const width = 500;
const height = 500;

const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
scene.add( camera );

camera.position.set(0, 0, 10);
camera.lookAt(0, 0, -300);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
const container = document.getElementById('impact-simulation');
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffaa00, 10);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const asteroid = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('static/asteroid.png')})
);

const earth = new THREE.Mesh(
    new THREE.SphereGeometry(250, 32, 32),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('static/earth.jpg')})
);

earth.position.set(-250, -250, -300);

scene.add(earth);

const pivot = new THREE.Object3D();
pivot.position.set(-125, -125, -300);
scene.add(pivot);

const point = new THREE.Mesh(
    new THREE.SphereGeometry(5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
);

point.position.set(-70, -70, -300);

scene.add(point);

pivot.add(asteroid);
asteroid.position.set(250, 250, -300);

const angle_input = document.getElementById("impact-angle");

function animate() {
    requestAnimationFrame(animate);

    pivot.rotation.set(0, 0, THREE.MathUtils.degToRad(angle_input.value) - Math.PI/2);

    controls.update();

    renderer.render(scene, camera);
}

animate();