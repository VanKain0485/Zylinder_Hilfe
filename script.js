import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const tips = [
  {
    title: 'Aufgabe 1: Zwei Größen finden',
    prompt: 'Eine Größe ist eine Fläche. Die andere zeigt, wie hoch der Körper ist.',
    answer: 'Du brauchst die <strong>Grundfläche</strong> und die <strong>Höhe</strong>.'
  },
  {
    title: 'Aufgabe 2: Abkürzungen',
    prompt: 'Beide Abkürzungen beginnen mit dem Anfangsbuchstaben des Fachbegriffs. Achte auf Groß- und Kleinschreibung.',
    answer: '<strong>Grundfläche → G</strong><br><strong>Höhe → h</strong>'
  },
  {
    title: 'Aufgabe 3: Am Zylinder markieren',
    prompt: 'Wo findest du die Strecke nach oben? Welche Fläche liegt unten?',
    answer: '<strong>h</strong> an die Strecke von unten nach oben außen am Mantel<br><strong>G</strong> an die Grundfläche unten'
  },
  {
    title: 'Aufgabe 4/5: Volumen-Idee',
    prompt: 'Denke an den Quader: Volumen entsteht aus einer Fläche und einer Höhe.',
    answer: 'Volumen = Grundfläche · Höhe<br><strong>V = G · h</strong>'
  },
  {
    title: 'Aufgabe 6: Form der Grundfläche',
    prompt: 'Schau auf die Grundfläche des Zylinders: Welche Form hat sie?',
    answer: 'Die Grundfläche ist ein <strong>Kreis</strong>.'
  },
  {
    title: 'Aufgabe 7: Kreis beschriften',
    prompt: 'Du brauchst den Mittelpunkt und zwei Strecken, die mit dem Kreis zusammenhängen.',
    answer: 'Du brauchst:<br><strong>M</strong> = Mittelpunkt<br><strong>d</strong> = Durchmesser<br><strong>r</strong> = Radius'
  },
  {
    title: 'Aufgabe 8: Auf den Zylinder übertragen',
    prompt: 'Fang mit d an. Dann findest du die Mitte. Erst danach zeichnest du r.',
    answer: '<ol><li>Zeichne zuerst <strong>d</strong> als Linie von Rand zu Rand.</li><li>Markiere die Mitte von <strong>d</strong> → das ist <strong>M</strong>.</li><li>Zeichne <strong>r</strong> von <strong>M</strong> bis zum Rand.</li></ol>'
  },
  {
    title: 'Aufgabe 9: Kreisflächenformel',
    prompt: 'Die Formel besteht aus π und dem Radius r.',
    answer: '<strong>G = π · r²</strong>'
  },
  {
    title: 'Aufgabe 10: Einsetzen in V = G · h',
    prompt: 'Nutze die Volumenformel V = G · h. Ersetze G durch das, was du in Aufgabe 9 herausgefunden hast.',
    answer: '<strong>V = G · h</strong><br><strong>G = π · r²</strong><br>also:<br><strong>V = π · r² · h</strong>'
  }
];

const tipSections = [
  { id: 'tipGridA', from: 0, to: 4 },
  { id: 'tipGridB', from: 4, to: 7 },
  { id: 'tipGridC', from: 7, to: 9 }
];

function renderTipCards(containerId, from, to) {
  const container = document.getElementById(containerId);
  const subset = tips.slice(from, to);

  subset.forEach((tip) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'tip-card';
    card.innerHTML = `
      <div class="tip-card-inner">
        <div class="tip-face front">
                    <h3>${tip.title}</h3>
          <div class="tip-body">${tip.prompt}</div>
        </div>
        <div class="tip-face back">
                    <h3>${tip.title}</h3>
          <div class="tip-body">${tip.answer}</div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => card.classList.toggle('flipped'));
    container.appendChild(card);
  });
}

tipSections.forEach((section) => renderTipCards(section.id, section.from, section.to));

const showSolutionButton = document.getElementById('showSolution');
const solution = document.getElementById('solution');
showSolutionButton.addEventListener('click', () => {
  solution.classList.toggle('hidden');
  showSolutionButton.textContent = solution.classList.contains('hidden') ? 'Lösung einblenden' : 'Lösung ausblenden';
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
  const cylinder = new THREE.Mesh(cylinderGeometry, new THREE.MeshStandardMaterial({ color: '#93c5fd', roughness: 0.32, metalness: 0.15 }));
  scene.add(cylinder);

  return { scene, camera, renderer, controls, cylinder };
}

function createHeightRod() {
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: '#047857' })
  );
  rod.position.set(0.98, 0, 0);
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

function initModel({ containerId, overlayId, legendId, featureConfig, calloutLabels = false }) {
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
    tag.className = `model-tag ${cfg.className} hidden`;
    tag.textContent = cfg.label;
    overlay.appendChild(tag);

    const arrow = document.createElement('div');
    arrow.className = `model-arrow ${cfg.className} hidden`;
    overlay.appendChild(arrow);

    features[key] = { ...cfg, active: false, tag, arrow };
  }

  function updateFeature(key) {
    const feature = features[key];
    feature.object.visible = feature.active;
    const showTag = feature.active && feature.showTag !== false;
    feature.tag.classList.toggle('hidden', !showTag);
    feature.arrow.classList.toggle('hidden', !showTag);
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

  function placeCallout(feature, pos, index) {
    const rightInset = container.clientWidth - 130;
    const targetY = 42 + index * 46;
    const y = Math.min(container.clientHeight - 18, Math.max(18, targetY));

    feature.tag.style.left = `${rightInset}px`;
    feature.tag.style.top = `${y}px`;

    const tagHalfWidth = feature.tag.offsetWidth / 2;
    const startX = rightInset - tagHalfWidth + 2;
    const startY = y;
    const dx = pos.x - startX;
    const dy = pos.y - startY;
    const length = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    feature.arrow.style.left = `${startX}px`;
    feature.arrow.style.top = `${startY}px`;
    feature.arrow.style.width = `${Math.max(8, length)}px`;
    feature.arrow.style.transform = `rotate(${angle}deg)`;
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    let calloutIndex = 0;
    for (const feature of Object.values(features)) {
      if (!feature.active || feature.showTag === false) {
        continue;
      }

      const pos = projectToScreen(feature.anchor, camera, container);
      if (!calloutLabels) {
        feature.tag.style.left = `${pos.x}px`;
        feature.tag.style.top = `${Math.min(container.clientHeight - 18, Math.max(18, pos.y))}px`;
      } else {
        placeCallout(feature, pos, calloutIndex);
        calloutIndex += 1;
      }

      feature.tag.style.opacity = pos.visible ? '1' : '0';
      feature.arrow.style.opacity = pos.visible ? '1' : '0';
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
  calloutLabels: false,
  featureConfig: {
    height: { object: model1Height, anchor: new THREE.Vector3(0.98, 0.15, 0), label: 'Höhe', className: 'height' },
    base: { object: model1Base, anchor: new THREE.Vector3(0, -1.3, 0), label: 'Grundfläche', className: 'base' }
  }
});

const centerPoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 20), new THREE.MeshStandardMaterial({ color: '#111827' }));
centerPoint.position.set(0, -1.2, 0);

const diameterLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 16), new THREE.MeshStandardMaterial({ color: '#3b82f6' }));
diameterLine.rotation.z = Math.PI / 2;
diameterLine.position.set(0, -1.2, 0);

const radiusLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 16), new THREE.MeshStandardMaterial({ color: '#dc2626' }));
radiusLine.rotation.x = Math.PI / 2;
radiusLine.position.set(0, -1.2, 0.5);

initModel({
  containerId: 'modelContainer2',
  overlayId: 'modelOverlay2',
  legendId: 'legendControls2',
  calloutLabels: true,
  featureConfig: {
    center: { object: centerPoint, anchor: new THREE.Vector3(0, -1.12, 0), label: 'Mittelpunkt M', className: 'center' },
    diameter: { object: diameterLine, anchor: new THREE.Vector3(0.55, -1.02, 0), label: 'Durchmesser d', className: 'diameter' },
    radius: { object: radiusLine, anchor: new THREE.Vector3(0.0, -1.02, 0.5), label: 'Radius r', className: 'radius' }
  }
});
