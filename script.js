import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const tips = [
  { title: 'Tipp 1: Grundfläche erkennen', prompt: 'Welche Form hat die Grundfläche eines Zylinders?', answer: 'Die Grundfläche ist ein Kreis.' },
  { title: 'Tipp 2: Kreisfläche wiederholen', prompt: 'Wie lautet die Formel für die Fläche eines Kreises?', answer: 'A = π · r²' },
  { title: 'Tipp 3: Vom Flächeninhalt zum Volumen', prompt: 'Wie bekommt man aus einer Grundfläche ein Volumen?', answer: 'Volumen = Grundfläche · Höhe' },
  { title: 'Tipp 4: Alles einsetzen', prompt: 'Setze die Kreisfläche in die Volumenformel ein.', answer: 'V = (π · r²) · h = π · r² · h' },
  { title: 'Tipp 5: Bedeutung der Variablen', prompt: 'Wofür stehen r und h?', answer: 'r ist der Radius der Kreisfläche, h ist die Höhe des Zylinders.' },
  { title: 'Tipp 6: Einheit prüfen', prompt: 'Welche Einheit hat das Volumen?', answer: 'Immer eine Kubikeinheit, z. B. cm³ oder m³.' }
];

const tipGrid = document.getElementById('tipGrid');
for (const tip of tips) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'tip-card';
  card.innerHTML = `<h3>${tip.title}</h3><p class="prompt">${tip.prompt}</p><p class="answer">${tip.answer}</p>`;
  card.addEventListener('click', () => card.classList.toggle('open'));
  tipGrid.appendChild(card);
}

const showSolutionButton = document.getElementById('showSolution');
const solution = document.getElementById('solution');
showSolutionButton.addEventListener('click', () => {
  solution.classList.toggle('hidden');
  showSolutionButton.textContent = solution.classList.contains('hidden') ? 'Musterlösung einblenden' : 'Musterlösung ausblenden';
});

function buildCommonScene(container, overlay) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f8fafc');

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(3.5, 2.7, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.insertBefore(renderer.domElement, overlay);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 2.8;
  controls.maxDistance = 8;
  controls.target.set(0, 0.1, 0);
  controls.update();

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(4, 7, 5);
  scene.add(dirLight);

  const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2.4, 64);
  const cylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.32, metalness: 0.15 }));
  scene.add(cylinder);
  scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(cylinderGeometry), new THREE.LineBasicMaterial({ color: '#1e3a8a' })));

  return { scene, camera, renderer, controls, cylinder };
}

function createHeightRod() {
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: '#047857' })
  );
  rod.position.set(1.2, 0, 0);
  return rod;
}

function projectToScreen(vector3, camera, container) {
  const projected = vector3.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * container.clientWidth,
    y: (-projected.y * 0.5 + 0.5) * container.clientHeight,
    visible: projected.z < 1
  };
}

function initModel({ containerId, overlayId, legendId, featureConfig, externalLabels = false }) {
  const container = document.getElementById(containerId);
  const overlay = document.getElementById(overlayId);
  const legend = document.getElementById(legendId);
  const buttons = legend.querySelectorAll('.legend-btn');

  const { scene, camera, renderer, controls } = buildCommonScene(container, overlay);

  const features = {};
  for (const [key, cfg] of Object.entries(featureConfig)) {
    scene.add(cfg.object);
    cfg.object.visible = false;
    const tag = document.createElement('div');
    tag.className = `model-tag ${cfg.className} ${externalLabels ? 'outside' : ''} hidden`; 
    tag.textContent = cfg.label;
    overlay.appendChild(tag);
    features[key] = { ...cfg, active: false, tag };
  }

  function updateFeature(key) {
    const feature = features[key];
    feature.object.visible = feature.active;
    if (feature.showTag !== false) {
      feature.tag.classList.toggle('hidden', !feature.active);
    } else {
      feature.tag.classList.add('hidden');
    }
    legend.querySelector(`.legend-btn[data-key="${key}"]`)?.classList.toggle('active', feature.active);
  }

  function toggleFeature(key) {
    features[key].active = !features[key].active;
    updateFeature(key);
  }

  buttons.forEach((btn) => btn.addEventListener('click', () => toggleFeature(btn.dataset.key)));

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    for (const [key, feature] of Object.entries(features)) {
      const hit = raycaster.intersectObject(feature.pickObject ?? feature.object, true);
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
      if (!feature.active || feature.showTag === false) {
        continue;
      }
      const pos = projectToScreen(feature.anchor, camera, container);
      if (!externalLabels) {
        feature.tag.style.left = `${pos.x}px`;
      }
      const y = Math.min(container.clientHeight - 18, Math.max(18, pos.y));
      feature.tag.style.top = `${y}px`;
      feature.tag.style.opacity = pos.visible ? '1' : '0';
    }

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

const model1Height = createHeightRod();
const model1Base = new THREE.Mesh(
  new THREE.CircleGeometry(0.98, 64),
  new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.75, side: THREE.DoubleSide })
);
model1Base.rotation.x = -Math.PI / 2;
model1Base.position.y = -1.205;

initModel({
  containerId: 'modelContainer',
  overlayId: 'modelOverlay',
  legendId: 'legendControls',
  externalLabels: false,
  featureConfig: {
    height: { object: model1Height, anchor: new THREE.Vector3(1.2, 0.15, 0), label: 'Höhe', className: 'height' },
    base: { object: model1Base, anchor: new THREE.Vector3(0, -1.3, 0), label: 'Grundfläche', className: 'base' }
  }
});

const model2Height = createHeightRod();
const model2Base = new THREE.Mesh(
  new THREE.CircleGeometry(0.98, 64),
  new THREE.MeshBasicMaterial({ color: '#f59e0b', transparent: true, opacity: 0.55, side: THREE.DoubleSide })
);
model2Base.rotation.x = -Math.PI / 2;
model2Base.position.y = -1.205;

const centerPoint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 20), new THREE.MeshStandardMaterial({ color: '#7c3aed' }));
centerPoint.position.set(0, -1.2, 0);

const diameterLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 16), new THREE.MeshStandardMaterial({ color: '#dc2626' }));
diameterLine.rotation.z = Math.PI / 2;
diameterLine.position.set(0, -1.2, 0);

const radiusLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 16), new THREE.MeshStandardMaterial({ color: '#0ea5e9' }));
radiusLine.rotation.x = Math.PI / 2;
radiusLine.position.set(0, -1.2, 0.5);

initModel({
  containerId: 'modelContainer2',
  overlayId: 'modelOverlay2',
  legendId: 'legendControls2',
  externalLabels: true,
  featureConfig: {
    height: { object: model2Height, anchor: new THREE.Vector3(1.2, 0.15, 0), label: 'Höhe h', className: 'height' },
    base: { object: model2Base, anchor: new THREE.Vector3(0, -1.3, 0), label: 'Grundfläche', className: 'base', showTag: false },
    center: { object: centerPoint, anchor: new THREE.Vector3(0, -1.12, 0), label: 'Mittelpunkt m', className: 'center' },
    diameter: { object: diameterLine, anchor: new THREE.Vector3(0, -1.02, 0), label: 'Durchmesser d', className: 'diameter' },
    radius: { object: radiusLine, anchor: new THREE.Vector3(0.48, -1.02, 0), label: 'Radius r', className: 'radius' }
  }
});
