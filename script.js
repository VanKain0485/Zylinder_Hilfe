import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const tips = [
  {
    title: 'Tipp 1: Grundfläche erkennen',
    prompt: 'Welche Form hat die Grundfläche eines Zylinders?',
    answer: 'Die Grundfläche ist ein Kreis.'
  },
  {
    title: 'Tipp 2: Kreisfläche wiederholen',
    prompt: 'Wie lautet die Formel für die Fläche eines Kreises?',
    answer: 'A = π · r²'
  },
  {
    title: 'Tipp 3: Vom Flächeninhalt zum Volumen',
    prompt: 'Wie bekommt man aus einer Grundfläche ein Volumen?',
    answer: 'Volumen = Grundfläche · Höhe'
  },
  {
    title: 'Tipp 4: Alles einsetzen',
    prompt: 'Setze die Kreisfläche in die Volumenformel ein.',
    answer: 'V = (π · r²) · h = π · r² · h'
  },
  {
    title: 'Tipp 5: Bedeutung der Variablen',
    prompt: 'Wofür stehen r und h?',
    answer: 'r ist der Radius der Kreisfläche, h ist die Höhe des Zylinders.'
  },
  {
    title: 'Tipp 6: Einheit prüfen',
    prompt: 'Welche Einheit hat das Volumen?',
    answer: 'Immer eine Kubikeinheit, z. B. cm³ oder m³.'
  }
];

const tipGrid = document.getElementById('tipGrid');
for (const tip of tips) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'tip-card';
  card.innerHTML = `
    <h3>${tip.title}</h3>
    <p class="prompt">${tip.prompt}</p>
    <p class="answer">${tip.answer}</p>
  `;
  card.addEventListener('click', () => card.classList.toggle('open'));
  tipGrid.appendChild(card);
}

const showSolutionButton = document.getElementById('showSolution');
const solution = document.getElementById('solution');
showSolutionButton.addEventListener('click', () => {
  solution.classList.toggle('hidden');
  showSolutionButton.textContent = solution.classList.contains('hidden')
    ? 'Musterlösung einblenden'
    : 'Musterlösung ausblenden';
});

const modelContainer = document.getElementById('modelContainer');
const modelOverlay = document.getElementById('modelOverlay');
const legendButtons = document.querySelectorAll('.legend-btn');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#f8fafc');

const camera = new THREE.PerspectiveCamera(55, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 100);
camera.position.set(3.5, 2.7, 4.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
modelContainer.insertBefore(renderer.domElement, modelOverlay);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2.8;
controls.maxDistance = 8;
controls.target.set(0, 0.3, 0);
controls.update();

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(4, 7, 5);
scene.add(dirLight);

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2.4, 64);
const cylinderMaterial = new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.32, metalness: 0.15 });
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
scene.add(cylinder);

const edgeLines = new THREE.LineSegments(
  new THREE.EdgesGeometry(cylinderGeometry),
  new THREE.LineBasicMaterial({ color: '#1e3a8a' })
);
scene.add(edgeLines);

const heightLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(1.2, -1.2, 0),
    new THREE.Vector3(1.2, 1.2, 0)
  ]),
  new THREE.LineBasicMaterial({ color: '#047857' })
);
scene.add(heightLine);
heightLine.visible = false;

const baseArea = new THREE.Mesh(
  new THREE.CircleGeometry(0.98, 64),
  new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.72, side: THREE.DoubleSide })
);
baseArea.rotation.x = -Math.PI / 2;
baseArea.position.y = -1.205;
scene.add(baseArea);
baseArea.visible = false;

const featureConfig = {
  height: {
    object: heightLine,
    pickObject: heightLine,
    anchor: new THREE.Vector3(1.2, 0.2, 0),
    label: 'Höhe',
    className: 'height'
  },
  base: {
    object: baseArea,
    pickObject: baseArea,
    anchor: new THREE.Vector3(0, -1.28, 0),
    label: 'Grundfläche',
    className: 'base'
  }
};

const features = {};
for (const [key, config] of Object.entries(featureConfig)) {
  const tag = document.createElement('div');
  tag.className = `model-tag ${config.className} hidden`;
  tag.textContent = config.label;
  modelOverlay.appendChild(tag);
  features[key] = { ...config, tag, active: false };
}

function projectToScreen(vector3) {
  const projected = vector3.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * modelContainer.clientWidth,
    y: (-projected.y * 0.5 + 0.5) * modelContainer.clientHeight,
    visible: projected.z < 1
  };
}

function updateFeatureView(key) {
  const feature = features[key];
  feature.object.visible = feature.active;
  feature.tag.classList.toggle('hidden', !feature.active);
  document.querySelector(`.legend-btn[data-key="${key}"]`)?.classList.toggle('active', feature.active);
}

function toggleFeature(key) {
  features[key].active = !features[key].active;
  updateFeatureView(key);
}

legendButtons.forEach((btn) => {
  btn.addEventListener('click', () => toggleFeature(btn.dataset.key));
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
renderer.domElement.addEventListener('click', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  for (const [key, feature] of Object.entries(features)) {
    const hit = raycaster.intersectObject(feature.pickObject, true);
    if (hit.length > 0) {
      toggleFeature(key);
      return;
    }
  }
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  for (const feature of Object.values(features)) {
    if (!feature.active) {
      continue;
    }
    const pos = projectToScreen(feature.anchor);
    feature.tag.style.left = `${pos.x}px`;
    feature.tag.style.top = `${pos.y}px`;
    feature.tag.style.opacity = pos.visible ? '1' : '0';
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  const width = modelContainer.clientWidth;
  const height = modelContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
