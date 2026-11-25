import * as THREE from 'three';

export function createMainGate() {
  const gate = new THREE.Group();
  gate.name = '主校门';
  gate.position.set(0, 0, 5.05);

  const material = (color, roughness = 0.75, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const redPanels = ['#a53827', '#ad3d2b', '#a83a28'].map(color => material(color, 0.55, 0.08));
  const panelJoint = material('#702a20');
  const flashing = material('#684539', 0.58, 0.2);
  const soffit = material('#aba39a', 0.76);
  const lightTrim = material('#ded4be', 0.5);
  const concrete = material('#a19789');
  const metal = material('#41494c', 0.5, 0.35);
  const hardware = material('#8e9799', 0.45, 0.45);
  const rubber = material('#25282a');
  const frame = material('#342c29', 0.52, 0.28);
  const glass = [material('#354c56', 0.24, 0.28), material('#536675', 0.28, 0.23)];

  function box(width, height, depth, x, y, z, finish, parent = gate) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), finish);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function brickFace(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7e4d3a';
    ctx.fillRect(0, 0, 256, 128);
    const colors = ['#874633', '#8a4935', '#814431', '#8e4c38', '#854734'];
    for (let row = 0; row < 12; row++) {
      for (let column = -1; column < 8; column++) {
        const colorIndex = (row * 3 + (column + 1) * 7) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(column * 32 + (row % 2) * 16 + 1, row * 128 / 12 + 0.5, 30, 9.6);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / 1.28, height / 0.72);
    texture.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95 });
  }

  function brickBlock(width, height, depth, x, y, z) {
    const front = brickFace(width, height);
    const side = brickFace(depth, height);
    return box(width, height, depth, x, y, z, [side, side, flashing, concrete, front, front]);
  }

  function cladBlock(width, height, depth, x, y, z, columns, rows) {
    const surface = 0.012;
    const seam = 0.009;
    box(width, height, depth, x, y, z, panelJoint);
    for (let row = 0; row < rows; row++) {
      const panelHeight = height / rows;
      const panelY = y - height / 2 + (row + 0.5) * panelHeight;
      for (let column = 0; column < columns; column++) {
        const panelWidth = width / columns;
        const panelX = x - width / 2 + (column + 0.5) * panelWidth;
        const finish = redPanels[(row + column * 2) % redPanels.length];
        for (const face of [-1, 1]) {
          box(panelWidth - seam, panelHeight - seam, surface,
            panelX, panelY, z + face * depth / 2, finish);
        }
      }
      for (const face of [-1, 1]) {
        box(surface, panelHeight - seam, depth, x + face * width / 2, panelY, z, redPanels[0]);
      }
    }
    box(width, surface, depth, x, y + height / 2, z, redPanels[1]);
  }

  // The brick pier projects above the thin, deep entrance canopy.
  brickBlock(0.75, 2.98, 0.88, -1.94, 1.49, 0.04);
  box(0.78, 0.045, 0.9, -1.94, 2.98, 0.04, flashing);
  box(4.9, 0.15, 1.1, -0.63, 2.12, 0, flashing);
  cladBlock(4.92, 0.225, 1.11, -0.63, 2.274, 0, 17, 1);
  for (let row = 0; row < 2; row++) {
    for (let column = 0; column < 16; column++) {
      box(0.299, 0.014, 0.52, -2.91 + column * 0.304, 2.039, -0.26 + row * 0.52, soffit);
    }
  }
  for (const x of [-2.55, -1.2, -0.35, 0.5, 1.35]) {
    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.009, 12), lightTrim);
    light.position.set(x, 2.028, 0.16);
    gate.add(light);
  }
  cladBlock(0.46, 2.17, 0.71, 1.72, 1.085, 0.035, 2, 6);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.063, 0.93, 16), metal);
  post.position.set(1.05, 1.58, 0.27);
  post.castShadow = true;
  gate.add(post);

  // The glazed guard booth is tucked under the canopy beside the red pier.
  const booth = new THREE.Group();
  booth.name = '门卫室';
  booth.position.set(1.18, 0, 0.005);
  gate.add(booth);
  box(0.98, 0.95, 0.79, 0, 0.475, 0, brickFace(0.98, 0.95), booth);
  box(1.03, 0.13, 0.87, 0, 0.992, 0, flashing, booth);
  box(0.83, 0.54, 0.033, 0, 0.56, 0.402, frame, booth);
  for (const [index, x] of [-0.267, 0, 0.267].entries()) {
    box(0.251, 0.36, 0.009, x, 0.504, 0.422, glass[index % 2], booth);
    box(0.251, 0.126, 0.009, x, 0.766, 0.422, glass[(index + 1) % 2], booth);
  }
  box(0.033, 0.72, 0.32, -0.496, 0.409, -0.12, frame, booth);
  box(0.013, 0.44, 0.23, -0.518, 0.534, -0.12, glass[0], booth);
  box(0.032, 0.018, 0.067, -0.531, 0.355, -0.03, hardware, booth);

  // The offset side frame has real openings between the cladded uprights.
  for (const x of [2.48, 3.07]) {
    cladBlock(0.14, 3.71, 0.49, x, 1.855, -0.095, 1, 12);
  }
  for (const y of [0.2, 1.18, 2.26, 3.57]) {
    cladBlock(0.73, 0.28, 0.49, 2.775, y, -0.095, 2, 1);
  }

  const grille = new THREE.Group();
  grille.name = '伸缩门';
  gate.add(grille);
  const step = 0.178;
  const firstPost = -1.49;
  const bays = 12;
  for (let index = 0; index <= bays; index++) {
    const x = firstPost + index * step;
    box(0.029, 0.61, 0.065, x, 0.35, 0.23, metal, grille);
    box(0.033, 0.023, 0.069, x, 0.662, 0.23, hardware, grille);
    if (index % 2 === 0) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.04, 12), rubber);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.039, 0.254);
      grille.add(wheel);
    }
  }
  const rise = 0.296;
  for (let index = 0; index < bays; index++) {
    const x = firstPost + (index + 0.5) * step;
    for (const direction of [-1, 1]) {
      const link = box(Math.hypot(step, rise), 0.021, 0.021,
        x, 0.322, 0.249 + direction * 0.013, metal, grille);
      link.rotation.z = direction * Math.atan2(rise, step);
    }
    box(0.025, 0.025, 0.01, x, 0.322, 0.278, hardware, grille);
  }
  box(0.146, 0.63, 0.18, 0.736, 0.354, 0.235, metal, grille);
  box(0.086, 0.026, 0.083, 0.736, 0.682, 0.235, hardware, grille);

  gate.traverse(object => {
    if (object.isMesh) object.userData.place = gate.name;
  });
  return gate;
}
