const sceneConfigs = [
  {
    elementId: 'scene-radius-vertical',
    radius: 3,
    height: 8,
    orientation: 'vertical',
    dimensionMode: 'radius',
    labels: {
      height: 'h = 8 cm',
      width: 'r = 3 cm',
      surface: 'r = 3 cm',
    },
  },
  {
    elementId: 'scene-diameter-vertical',
    radius: 3,
    height: 9,
    orientation: 'vertical',
    dimensionMode: 'diameter',
    labels: {
      height: 'h = 9 cm',
      width: 'd = 6 cm',
      surface: 'd = 6 cm',
    },
  },
  {
    elementId: 'scene-radius-horizontal',
    radius: 2.5,
    height: 10,
    orientation: 'horizontal',
    dimensionMode: 'radius',
    labels: {
      height: 'h = 10 cm',
      width: 'r = 2,5 cm',
      surface: 'r = 2,5 cm',
    },
  },
  {
    elementId: 'scene-diameter-horizontal',
    radius: 4,
    height: 7,
    orientation: 'horizontal',
    dimensionMode: 'diameter',
    labels: {
      height: 'h = 7 cm',
      width: 'd = 8 cm',
      surface: 'd = 8 cm',
    },
  },
];

const activeScenes = [];

function createLabelSprite(text, options = {}) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = options.fontSize || 42;
  const padding = options.padding || 20;
  context.font = `700 ${fontSize}px Arial`;
  const metrics = context.measureText(text);
  canvas.width = metrics.width + padding * 2;
  canvas.height = fontSize + padding * 2;

  context.font = `700 ${fontSize}px Arial`;
  context.fillStyle = options.background || 'rgba(255,255,255,0.95)';
  roundRect(context, 0, 0, canvas.width, canvas.height, 18);
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = options.border || 'rgba(34,81,163,0.25)';
  context.stroke();
  context.fillStyle = options.color || '#123768';
  context.textBaseline = 'middle';
  context.fillText(text, padding, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  const scaleBase = options.scale || 0.018;
  sprite.scale.set(canvas.width * scaleBase, canvas.height * scaleBase, 1);
  return sprite;
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function addArrow(scene, start, end, color, labelText, labelOffset) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const normalized = direction.clone().normalize();
  const arrow = new THREE.ArrowHelper(normalized, start, length, color, 0.45, 0.24);
  scene.add(arrow);

  const reverse = new THREE.ArrowHelper(normalized.clone().negate(), end, length, color, 0.45, 0.24);
  scene.add(reverse);

  if (labelText) {
    const label = createLabelSprite(labelText, {
      background: 'rgba(255,255,255,0.96)',
      border: 'rgba(27, 57, 108, 0.25)',
      color: '#16386f',
    });
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midpoint.add(labelOffset || new THREE.Vector3(0, 0, 0));
    label.position.copy(midpoint);
    scene.add(label);
  }
}

function buildCylinderScene(config) {
  const container = document.getElementById(config.elementId);
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe8effa);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(10, 9, 10);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.minDistance = 6;
  controls.maxDistance = 24;
  controls.target.set(0, 1, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(8, 10, 7);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-6, 5, -8);
  scene.add(fillLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(8, 48),
    new THREE.MeshStandardMaterial({ color: 0xcfdcf2, transparent: true, opacity: 0.7 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -config.radius - 0.05;
  if (config.orientation === 'vertical') {
    floor.position.y = -0.05;
  }
  scene.add(floor);

  const cylinderMaterial = new THREE.MeshStandardMaterial({
    color: 0x4d8af0,
    roughness: 0.32,
    metalness: 0.15,
  });
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(config.radius, config.radius, config.height, 64, 1, false),
    cylinderMaterial
  );

  if (config.orientation === 'horizontal') {
    cylinder.rotation.z = Math.PI / 2;
    controls.target.set(0, 0, 0);
  } else {
    cylinder.position.y = config.height / 2;
    controls.target.set(0, config.height / 2, 0);
  }

  scene.add(cylinder);

  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(cylinder.geometry),
    new THREE.LineBasicMaterial({ color: 0x16386f })
  );
  outline.position.copy(cylinder.position);
  outline.rotation.copy(cylinder.rotation);
  scene.add(outline);

  addDimensionAnnotations(scene, config);

  const infoLabel = createLabelSprite(config.labels.surface, {
    background: 'rgba(244,185,66,0.93)',
    border: 'rgba(146,99,0,0.25)',
    color: '#5c3a00',
    scale: 0.016,
  });

  if (config.orientation === 'vertical') {
    infoLabel.position.set(0, config.height + 1.2, 0);
  } else {
    infoLabel.position.set(0, config.radius + 1.7, 0);
  }
  scene.add(infoLabel);

  activeScenes.push({ container, camera, renderer, controls, scene });
}

function addDimensionAnnotations(scene, config) {
  const arrowColor = 0xd1495b;
  const widthColor = 0x2d6a4f;

  if (config.orientation === 'vertical') {
    addArrow(
      scene,
      new THREE.Vector3(config.radius + 1.2, 0, 0),
      new THREE.Vector3(config.radius + 1.2, config.height, 0),
      arrowColor,
      config.labels.height,
      new THREE.Vector3(1.3, 0, 0)
    );

    if (config.dimensionMode === 'radius') {
      addArrow(
        scene,
        new THREE.Vector3(0, 0.18, 0),
        new THREE.Vector3(config.radius, 0.18, 0),
        widthColor,
        config.labels.width,
        new THREE.Vector3(0, 0.9, 0)
      );
    } else {
      addArrow(
        scene,
        new THREE.Vector3(-config.radius, 0.18, 0),
        new THREE.Vector3(config.radius, 0.18, 0),
        widthColor,
        config.labels.width,
        new THREE.Vector3(0, 0.9, 0)
      );
    }
    return;
  }

  addArrow(
    scene,
    new THREE.Vector3(-config.height / 2, -config.radius - 1.2, 0),
    new THREE.Vector3(config.height / 2, -config.radius - 1.2, 0),
    arrowColor,
    config.labels.height,
    new THREE.Vector3(0, -1.05, 0)
  );

  if (config.dimensionMode === 'radius') {
    addArrow(
      scene,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, config.radius, 0),
      widthColor,
      config.labels.width,
      new THREE.Vector3(1.35, 0, 0)
    );
  } else {
    addArrow(
      scene,
      new THREE.Vector3(0, -config.radius, 0),
      new THREE.Vector3(0, config.radius, 0),
      widthColor,
      config.labels.width,
      new THREE.Vector3(1.45, 0, 0)
    );
  }
}

function animate() {
  requestAnimationFrame(animate);
  activeScenes.forEach(({ renderer, scene, camera, controls }) => {
    controls.update();
    renderer.render(scene, camera);
  });
}

function resizeScenes() {
  activeScenes.forEach(({ container, camera, renderer }) => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}

sceneConfigs.forEach(buildCylinderScene);
animate();
window.addEventListener('resize', resizeScenes);
