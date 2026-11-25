import * as THREE from './node_modules/three/build/three.module.js';

export function createEastClassroom() {
  const building = new THREE.Group();
  building.name = '东侧教学楼';

  const material = (color, roughness = 0.82) => new THREE.MeshStandardMaterial({ color, roughness });
  const brick = material('#71382f', 0.92);
  const orange = material('#ed641d', 0.7);
  const white = material('#eeeae1', 0.78);
  const trim = material('#c9c5bc', 0.85);
  const glass = material('#334d59', 0.34);
  const frame = material('#343737', 0.55);
  const dark = material('#251f1d', 0.78);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const batches = new Map();
  const transform = new THREE.Object3D();

  function box(width, height, depth, x, y, z, finish) {
    transform.position.set(x, y, z);
    transform.scale.set(width, height, depth);
    transform.updateMatrix();
    if (!batches.has(finish)) batches.set(finish, []);
    batches.get(finish).push(transform.matrix.clone());
  }

  const length = 5.05;
  const depth = 1.48;
  const base = 0.1;
  const floor = 0.64;
  const roofY = base + floor * 3;

  box(length, base, depth, 0, base / 2, 0, trim);
  box(length, floor, depth, 0, base + floor / 2, 0, brick);
  box(length, floor, depth, 0, base + floor * 1.5, 0, brick);
  box(length, floor, depth, 0, base + floor * 2.5, 0, orange);

  for (const level of [base + floor, base + floor * 2, roofY]) {
    box(length + 0.12, 0.09, depth + 0.12, 0, level, 0, white);
    box(length + 0.18, 0.055, 0.12, 0, level + 0.055, 0.78, trim);
  }

  // Upper storey glazing sits above the orange facade band.
  for (let bay = 0; bay < 9; bay++) {
    const x = -2.04 + bay * 0.51;
    box(0.39, 0.27, 0.04, x, roofY - 0.19, 0.755, glass);
    box(0.035, 0.31, 0.055, x - 0.21, roofY - 0.19, 0.78, frame);
    box(0.035, 0.31, 0.055, x + 0.21, roofY - 0.19, 0.78, frame);
    box(0.44, 0.035, 0.06, x, roofY - 0.025, 0.78, white);
    box(0.025, 0.26, 0.045, x, roofY - 0.19, 0.81, frame);

    box(0.39, 0.27, 0.04, x, roofY - 0.19, -0.755, glass);
    box(0.035, 0.31, 0.055, x - 0.21, roofY - 0.19, -0.78, frame);
    box(0.035, 0.31, 0.055, x + 0.21, roofY - 0.19, -0.78, frame);
    box(0.44, 0.035, 0.06, x, roofY - 0.025, -0.78, white);
    box(0.025, 0.26, 0.045, x, roofY - 0.19, -0.81, frame);
  }

  // Repeated windows break up the broad middle-storey brick facade.
  for (let bay = 0; bay < 9; bay++) {
    const x = -2.05 + bay * 0.51;
    box(0.35, 0.34, 0.045, x, 1.06, 0.755, glass);
    box(0.035, 0.39, 0.055, x - 0.19, 1.06, 0.78, frame);
    box(0.035, 0.39, 0.055, x + 0.19, 1.06, 0.78, frame);
    box(0.4, 0.035, 0.055, x, 1.26, 0.78, white);
    box(0.4, 0.035, 0.055, x, 0.86, 0.78, white);
    box(0.025, 0.29, 0.045, x, 1.06, 0.81, frame);
  }

  // Keep the entrance rhythm clear, with doors spaced between classroom windows.
  for (let bay = 0; bay < 9; bay++) {
    const x = -2.05 + bay * 0.51;
    if (bay === 1 || bay === 4 || bay === 7) {
      box(0.23, 0.5, 0.05, x, 0.35, 0.755, frame);
      box(0.18, 0.45, 0.025, x, 0.325, 0.787, orange);
      box(0.13, 0.08, 0.018, x, 0.515, 0.804, glass);
      box(0.014, 0.012, 0.012, x + 0.06, 0.14, 0.806, trim);
    } else {
      box(0.35, 0.3, 0.045, x, 0.28, 0.755, glass);
      box(0.035, 0.35, 0.055, x - 0.19, 0.28, 0.78, frame);
      box(0.035, 0.35, 0.055, x + 0.19, 0.28, 0.78, frame);
      box(0.4, 0.035, 0.055, x, 0.46, 0.78, white);
      box(0.4, 0.035, 0.055, x, 0.1, 0.78, white);
      box(0.025, 0.26, 0.045, x, 0.28, 0.81, frame);
    }
  }

  for (const x of [-2.28, -1.15, 0, 1.15, 2.28]) {
    box(0.16, floor * 2, 0.16, x, base + floor, 0.69, brick);
  }

  // The central white volume projects beyond the orange third-floor wings.
  box(1.72, 0.64, 0.34, 0, 1.7, 0.9, white);
  box(0.2, 0.75, 0.15, -0.92, 1.68, 1.01, orange);
  box(0.2, 0.75, 0.15, 0.92, 1.68, 1.01, orange);
  for (const x of [-0.62, 0.62]) {
    for (let slat = 0; slat < 10; slat++) {
      box(0.035, 0.52, 0.07, x + (slat - 4.5) * 0.05, 1.7, 1.08, frame);
    }
  }
  box(1.88, 0.09, 0.18, 0, 2.02, 1.02, white);
  box(1.88, 0.09, 0.18, 0, 1.38, 1.02, white);

  // A shallow covered corridor runs along the courtyard side.
  box(length + 0.18, 0.09, 0.42, 0, 0.72, 0.92, white);
  box(length + 0.24, 0.065, 0.1, 0, 0.77, 1.12, trim);
  for (let post = 0; post < 9; post++) {
    const x = -2.35 + post * 0.59;
    box(0.07, 0.62, 0.07, x, 0.39, 1.05, white);
  }
  box(length, 0.2, 0.09, 0, 0.61, 1.16, white);

  // The third-floor corridor is the only upper-level balcony.
  box(length + 0.18, 0.07, 0.42, 0, 1.415, 0.98, white);
  box(length + 0.18, 0.2, 0.09, 0, 1.58, 1.19, white);

  box(length + 0.22, 0.1, depth + 0.2, 0, roofY + 0.05, 0, trim);

  for (const [finish, matrices] of batches) {
    const instances = new THREE.InstancedMesh(boxGeometry, finish, matrices.length);
    instances.name = `${building.name} · ${finish.name || '构件'}`;
    instances.userData.place = building.name;
    instances.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    matrices.forEach((matrix, index) => instances.setMatrixAt(index, matrix));
    instances.computeBoundingSphere();
    building.add(instances);
  }

  building.position.set(6.1, 0, -0.1);
  building.rotation.y = -Math.PI / 2;
  return building;
}
