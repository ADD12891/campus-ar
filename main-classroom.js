import * as THREE from './node_modules/three/build/three.module.js';

export function createMainClassroom() {
  const building = new THREE.Group();
  building.name = '主教学楼';

  const materials = {
    brick: new THREE.MeshStandardMaterial({ color: '#984b3d', roughness: 0.9 }),
    frame: new THREE.MeshStandardMaterial({ color: '#df4c2e', roughness: 0.56 }),
    frameLight: new THREE.MeshStandardMaterial({ color: '#e75a39', roughness: 0.56 }),
    white: new THREE.MeshStandardMaterial({ color: '#eeeae0', roughness: 0.76 }),
    coping: new THREE.MeshStandardMaterial({ color: '#faf7ed', roughness: 0.65 }),
    concrete: new THREE.MeshStandardMaterial({ color: '#b9b5aa', roughness: 0.92 }),
    glass: new THREE.MeshStandardMaterial({ color: '#405763', roughness: 0.32, metalness: 0.12 }),
    glassLight: new THREE.MeshStandardMaterial({ color: '#617b88', roughness: 0.32, metalness: 0.1 }),
    dark: new THREE.MeshStandardMaterial({ color: '#292d2c', roughness: 0.62 }),
    louver: new THREE.MeshStandardMaterial({ color: '#dedbd1', roughness: 0.58 }),
  };
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const batches = new Map();
  const transform = new THREE.Object3D();

  function box(width, height, depth, x, y, z, material) {
    transform.position.set(x, y, z);
    transform.scale.set(width, height, depth);
    transform.updateMatrix();
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(transform.matrix.clone());
  }

  const width = 9.2;
  const depth = 1.45;
  const floorHeight = 0.68;
  const baseHeight = 0.12;
  const totalHeight = baseHeight + floorHeight * 4;

  box(width, baseHeight, depth, 0, baseHeight / 2, 0, materials.concrete);
  box(width, floorHeight * 4, 0.94, 0, baseHeight + floorHeight * 2, -0.22, materials.brick);

  for (let floor = 0; floor < 4; floor++) {
    const level = baseHeight + floorHeight * (floor + 1);
    box(width + 0.14, 0.09, depth + 0.16, 0, level, 0, materials.white);
    box(width + 0.22, 0.035, 0.07, 0, level + 0.048, 0.79, materials.coping);
    box(width, 0.07, 0.52, 0, level - 0.055, 0.99, materials.concrete);

    const base = baseHeight + floorHeight * floor;
    for (let bay = 0; bay < 8; bay++) {
      const center = -3.85 + bay * 1.1;
      const doorX = center - 0.27;
      const windowX = center + 0.27;

      box(0.19, 0.49, 0.045, doorX, base + 0.245, 0.325, materials.dark);
      box(0.155, 0.45, 0.022, doorX, base + 0.24, 0.351, materials.frame);
      box(0.108, 0.082, 0.012, doorX, base + 0.408, 0.368, materials.glassLight);
      box(0.012, 0.01, 0.01, doorX + 0.048, base + 0.21, 0.368, materials.concrete);

      box(0.46, 0.43, 0.045, windowX, level - 0.29, 0.265, materials.dark);
      box(0.414, 0.37, 0.018, windowX, level - 0.29, 0.293,
        (bay + floor) % 3 === 0 ? materials.glassLight : materials.glass);
      box(0.419, 0.025, 0.025, windowX, level - 0.29, 0.308, materials.white);
      box(0.022, 0.33, 0.025, windowX, level - 0.29, 0.31, materials.dark);
      box(0.48, 0.035, 0.055, windowX, level - 0.07, 0.285, materials.white);
      box(0.48, 0.035, 0.055, windowX, level - 0.51, 0.285, materials.white);
      box(0.48, 0.025, 0.11, windowX, level - 0.54, 0.32, materials.concrete);
    }
  }

  // Keep the orange portal frames aligned as open, continuous outlines.
  for (const x of [-4.35, 0, 4.35]) {
    const postOffset = 0.46;
    const postWidth = 0.15;
    box(postWidth, totalHeight, 0.16, x - postOffset, totalHeight / 2, 0.67, materials.frame);
    box(postWidth, totalHeight, 0.16, x + postOffset, totalHeight / 2, 0.67, materials.frame);
    for (let floor = 1; floor < 4; floor++) {
      const y = baseHeight + floorHeight * floor;
      box(postOffset * 2 + postWidth, 0.115, 0.16, x, y, 0.67, materials.frameLight);
    }
    box(postOffset * 2 + postWidth, 0.14, 0.16, x, totalHeight - 0.07, 0.67, materials.frameLight);
  }

  const grilleWidth = 0.62;
  const grilleSide = 0.15;
  box(grilleSide, totalHeight, 0.2, -grilleWidth / 2 - grilleSide / 2, totalHeight / 2, 0.7, materials.frame);
  box(grilleSide, totalHeight, 0.2, grilleWidth / 2 + grilleSide / 2, totalHeight / 2, 0.7, materials.frame);
  for (let floor = 0; floor < 4; floor++) {
    const bottom = baseHeight + floorHeight * floor;
    const louverHeight = floorHeight - 0.19;
    box(grilleWidth, louverHeight, 0.08, 0, bottom + floorHeight / 2, 0.79, materials.dark);
    for (let slat = 0; slat < 13; slat++) {
      box(0.025, louverHeight, 0.09, -0.28 + slat * 0.0467, bottom + floorHeight / 2, 0.85,
        slat % 2 === 0 ? materials.louver : materials.white);
    }
    if (floor > 0) {
      box(grilleWidth + grilleSide * 2, 0.1, 0.2, 0, bottom, 0.7, materials.frameLight);
    }
  }

  for (let step = 0; step < 4; step++) {
    box(1.9, 0.045, 0.21, 0, 0.035 + step * 0.03, 1.02 - step * 0.1, materials.concrete);
  }

  box(width + 0.32, 0.09, depth + 0.22, 0, totalHeight + 0.05, 0, materials.concrete);

  for (const [material, matrices] of batches) {
    const instances = new THREE.InstancedMesh(boxGeometry, material, matrices.length);
    instances.name = `${building.name} · ${material.name || '构件'}`;
    instances.userData.place = building.name;
    instances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    matrices.forEach((matrix, index) => instances.setMatrixAt(index, matrix));
    instances.computeBoundingSphere();
    building.add(instances);
  }

  return building;
}
