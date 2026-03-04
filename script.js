import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

const tips = [
  {
    title: 'Aufgabe 1: Welche zwei Größen?',
    prompt: 'Denk an Quader/Prisma: Welche zwei Angaben braucht man immer fürs Volumen?',
    answer: 'Eine Größe beschreibt die Fläche unten → Grundfläche. Eine Größe beschreibt „nach oben“ → Höhe.'
  },
  {
    title: 'Aufgabe 1: Fachbegriffe finden',
    prompt: 'Wie heißen die beiden Größen als Fachbegriffe?',
    answer: 'Grundfläche und Höhe.'
  },
  {
    title: 'Aufgabe 2: Höhe markieren',
    prompt: 'Wo ist die Höhe am Zylinder?',
    answer: 'Höhe = Strecke von unten nach oben außen am Mantel. → Pfeil/Linie setzen und „Höhe“ dazuschreiben.'
  },
  {
    title: 'Aufgabe 2: Grundfläche markieren',
    prompt: 'Was ist die Grundfläche?',
    answer: 'Grundfläche = Fläche, auf der der Zylinder steht (unten). → Unten umranden/markieren und „Grundfläche“ dazuschreiben.'
  },
  {
    title: 'Aufgabe 3: Abkürzungen zuordnen',
    prompt: 'Welche Abkürzungen nutzt man für Grundfläche und Höhe?',
    answer: 'Grundfläche → G, Höhe → h (h klein!).'
  },
  {
    title: 'Aufgabe 5/6: Volumen-Idee übertragen',
    prompt: 'Wie war die Regel beim Quader/Prisma?',
    answer: 'Volumen = Grundfläche · Höhe, also V = G · h.'
  },
  {
    title: 'Aufgabe 7: Form der Grundfläche',
    prompt: 'Welche Form hat die Grundfläche beim Zylinder?',
    answer: 'Die Grundfläche ist ein Kreis.'
  },
  {
    title: 'Aufgabe 8: Was muss im Kreis beschriftet werden?',
    prompt: 'Welche drei Beschriftungen brauchst du am Kreis, um später G berechnen zu können?',
    answer: '✅ Mittelpunkt M, ✅ Durchmesser d, ✅ Radius r.'
  },
  {
    title: 'Aufgabe 8: Durchmesser erkennen',
    prompt: 'Welche Linie im Kreis ist der Durchmesser d?',
    answer: 'Der Durchmesser ist die ganze Strecke von Rand zu Rand, die durch den Mittelpunkt M geht. → d an diese lange Linie schreiben.'
  },
  {
    title: 'Aufgabe 8: Radius erkennen',
    prompt: 'Welche Linie im Kreis ist der Radius r?',
    answer: 'Radius = Strecke vom Mittelpunkt M bis zum Rand (halber Durchmesser). → r an diese „halbe“ Linie schreiben. Merke: r = d/2.'
  },
  {
    title: 'Aufgabe 9: Übertragen auf den Zylinder',
    prompt: 'Wie findest du oben am Zylinder den Mittelpunkt M, damit d/r stimmen?',
    answer: '1) Zeichne zuerst d (Rand–Rand) oben ungefähr durch die Mitte. 2) Halbiere d → dort ist M. 3) Von M zum Rand zeichnen = r.'
  },
  {
    title: 'Aufgabe 10: Kreisflächenformel',
    prompt: 'Wie lautet die Formel für die Kreisfläche?',
    answer: 'G = π · r².'
  },
  {
    title: 'Aufgabe 11: Einsetzen',
    prompt: 'Setze die Kreisfläche in V = G · h ein.',
    answer: 'V = G · h, G = πr² ⇒ V = (πr²) · h.'
  },
  {
    title: 'Aufgabe 12: Klammer auflösen',
    prompt: 'Klammer auflösen: Was bleibt stehen?',
    answer: 'V = (πr²) · h = πr²h.'
  }
];

const tipSections = [
  { id: 'tipGridA', from: 0, to: 4 },
  { id: 'tipGridB', from: 4, to: 8 },
  { id: 'tipGridC', from: 8, to: 14 }
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
          <p>${tip.prompt}</p>
        </div>
        <div class="tip-face back">
                    <h3>${tip.title}</h3>
          <p>${tip.answer}</p>
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

const centerPoint = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 20), new THREE.MeshStandardMaterial({ color: '#14b8a6' }));
centerPoint.position.set(0, -1.2, 0);

const diameterLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2, 16), new THREE.MeshStandardMaterial({ color: '#e11d48' }));
diameterLine.rotation.z = Math.PI / 2;
diameterLine.position.set(0, -1.2, 0);

const radiusLine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 16), new THREE.MeshStandardMaterial({ color: '#7c3aed' }));
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
