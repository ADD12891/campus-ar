import * as THREE from 'three';
import { mergeGeometries } from './node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

export function createWestClassroom() {
  const building = new THREE.Group();
  building.name = '西侧教学楼';
  building.position.set(-6.1, 0, -0.1);
  // The open corridors face east into the campus plaza.
  building.rotation.y = Math.PI / 2;

  const finish = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
  const concrete = finish('#d9d2c6');
  const white = finish('#f3eee2');
  const coping = finish('#faf7ed', 0.65);
  const cement = finish('#aaa9a3');
  const tread = finish('#8b8b87');
  const roof = finish('#827f78');
  const joint = finish('#ac3020');
  const cladding = ['#db482d', '#e14e31', '#d94229'].map(color => finish(color, 0.53));
  const door = finish('#c64e2b', 0.58);
  const doorEdge = finish('#8a3321');
  const blackFrame = finish('#292b2b', 0.58);
  const glass = ['#425760', '#566d7c', '#738a9e', '#34434b'].map(color => finish(color, 0.28));
  const curtain = finish('#a4afba', 0.68);
  const metal = finish('#9c9990', 0.4);

  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = tileCanvas.height = 128;
  const tile = tileCanvas.getContext('2d');
  tile.fillStyle = '#8d574b';
  tile.fillRect(0, 0, 128, 128);
  const tileColors = ['#a56554', '#aa6958', '#a26151', '#a86757', '#ad6a59', '#a16354'];
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      tile.fillStyle = tileColors[(row * 7 + column * 11 + row * column) % tileColors.length];
      tile.fillRect(column * 16 + 0.65, row * 16 + 0.65, 14.7, 14.7);
    }
  }
  const wallTiles = new THREE.CanvasTexture(tileCanvas);
  wallTiles.colorSpace = THREE.SRGBColorSpace;
  wallTiles.wrapS = wallTiles.wrapT = THREE.RepeatWrapping;
  wallTiles.anisotropy = 8;
  const brick = new THREE.MeshStandardMaterial({ map: wallTiles, roughness: 0.87 });

  const batches = new Map();
  function box(width, height, depth, x, y, z, material, angle = 0) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    if (material === brick) {
      const uv = geometry.getAttribute('uv');
      for (let index = 0; index < uv.count; index++) {
        const span = index < 8 ? depth : width;
        const rise = index >= 8 && index < 16 ? depth : height;
        uv.setXY(index, uv.getX(index) * span / 0.14, uv.getY(index) * rise / 0.14);
      }
    }
    geometry.rotateX(angle);
    geometry.translate(x, y, z);
    if (!batches.has(material)) batches.set(material, []);
    batches.get(material).push(geometry);
  }

  const width = 5.05;
  const base = 0.1;
  const storey = 0.49;
  const roofLevel = base + storey * 4;
  const corridorFront = 0.76;
  const classroomFront = 0.31;

  box(width, base, 1.49, 0, base / 2, -0.005, cement);
  for (let step = 0; step < 3; step++) {
    box(width - 0.02, 0.043, 0.118, 0, 0.035 + step * 0.022, 0.826 - step * 0.038, tread);
  }
  box(4.04, storey * 4, 1.055, 0, base + storey * 2, classroomFront - 1.055 / 2, brick);
  box(width, 0.075, 1.53, 0, roofLevel, -0.015, roof);
  box(width + 0.025, 0.024, 0.033, 0, roofLevel + 0.038, 0.759, coping);
  box(width, 0.084, 0.044, 0, roofLevel + 0.037, -0.765, concrete);
  for (const x of [-2.502, 2.502]) {
    box(0.046, 0.084, 1.53, x, roofLevel + 0.037, -0.015, concrete);
  }

  const frames = [[-2.53, -2.115], [-0.545, 0.002], [2.07, 2.53]];
  const whiteBays = [[-2.115, -0.545], [0.002, 2.07]];
  function cladBand(left, right, y, height, sections) {
    const length = right - left;
    const pitch = length / sections;
    box(length, height, 0.092, (left + right) / 2, y, corridorFront, joint);
    for (let index = 0; index < sections; index++) {
      box(pitch - 0.004, height - 0.006, 0.018,
        left + (index + 0.5) * pitch, y, corridorFront + 0.047, cladding[index % cladding.length]);
    }
  }

  for (let level = 1; level <= 4; level++) {
    const floor = base + level * storey;
    box(width, 0.047, 0.47, 0, floor - 0.015, 0.535, concrete);
    for (const x of [-1.93, -1.50, -1.06, -0.67, 0.2, 0.61, 1.02, 1.43, 1.85]) {
      box(0.029, 0.045, 0.435, x, floor - 0.052, 0.513, concrete);
    }
    const roofBand = level === 4;
    const bandY = floor + (roofBand ? -0.035 : 0.053);
    for (const [left, right] of whiteBays) {
      box(right - left, 0.137, 0.075, (left + right) / 2, bandY, corridorFront, white);
      box(right - left, 0.014, 0.086, (left + right) / 2, bandY + 0.071, corridorFront, coping);
    }
    for (const [left, right] of frames) {
      cladBand(left, right, bandY, 0.147, right - left > 0.5 ? 5 : 4);
    }
  }

  for (const [left, right] of frames) {
    for (const x of [left + 0.036, right - 0.036]) {
      box(0.074, roofLevel + 0.039, 0.125, x, (roofLevel + 0.039) / 2, corridorFront, joint);
      const sections = 12;
      const pitch = (roofLevel + 0.039) / sections;
      for (let index = 0; index < sections; index++) {
        box(0.073, pitch - 0.004, 0.130, x, (index + 0.5) * pitch, corridorFront + 0.006,
          cladding[index % cladding.length]);
      }
    }
  }

  function window(x, y, z, span, shade, curtains) {
    box(span, 0.255, 0.022, x, y, z, blackFrame);
    for (const side of [-1, 1]) {
      const paneX = x + side * (span - 0.021) / 4;
      box((span - 0.032) / 2, 0.067, 0.012, paneX, y + 0.076, z + 0.012, glass[shade]);
      box((span - 0.032) / 2, 0.151, 0.012, paneX, y - 0.04, z + 0.012, glass[(shade + 1) % glass.length]);
      if (curtains) {
        for (let strip = 0; strip < 5; strip++) {
          box(0.004, 0.12, 0.002, paneX + (strip - 2) * 0.009, y - 0.024, z + 0.019, curtain);
        }
      }
    }
    box(span + 0.019, 0.011, 0.045, x, y - 0.13, z + 0.006, cement);
  }

  const doorPositions = [-1.87, -1.28, -0.82, -0.43, -0.17, 0.64, 0.85, 1.63, 1.86];
  const windowPositions = [
    [-1.64, 0.20], [-1.05, 0.25], [-0.63, 0.16], [0.17, 0.25], [0.46, 0.19],
    [1.08, 0.23], [1.38, 0.23], [2.00, 0.12]
  ];
  for (let level = 0; level < 4; level++) {
    const floor = base + level * storey;
    for (const x of doorPositions) {
      box(0.126, 0.323, 0.026, x, floor + 0.163, 0.318, doorEdge);
      box(0.108, 0.306, 0.018, x, floor + 0.158, 0.338, door);
      box(0.083, 0.061, 0.008, x, floor + 0.259, 0.350, blackFrame);
      box(0.073, 0.049, 0.008, x, floor + 0.259, 0.354, glass[level % glass.length]);
      box(0.015, 0.006, 0.008, x + 0.033, floor + 0.139, 0.352, metal);
      box(0.022, 0.051, 0.008, x - 0.082, floor + 0.256, 0.32, coping);
    }
    for (const [index, [x, span]] of windowPositions.entries()) {
      window(x, floor + 0.242, 0.322, span, (index + level) % glass.length, (index + level) % 3 === 0);
    }
    for (const x of [-1.47, -0.62, 0.32, 1.20, 1.97]) {
      box(0.021, 0.432, 0.018, x, floor + 0.22, 0.312, brick);
    }
    // Rear glazing and stairwell layout are estimated from the front elevation.
    for (const x of [-1.78, -1.32, -0.85, -0.39, 0.39, 0.85, 1.32, 1.78]) {
      box(0.27, 0.248, 0.018, x, floor + 0.246, -0.754, blackFrame);
      for (const offset of [-0.064, 0.064]) {
        box(0.118, 0.222, 0.012, x + offset, floor + 0.246, -0.767, glass[1]);
      }
    }
  }

  for (const end of [-1, 1]) {
    const shaft = end * 2.26;
    box(0.49, storey * 4, 0.055, shaft, base + 2 * storey, -0.739, concrete);
    for (let level = 0; level < 3; level++) {
      const bottom = base + storey * level;
      box(0.46, 0.039, 0.14, shaft, bottom + storey / 2 - 0.015, -0.588, cement);
      for (const flight of [0, 1]) {
        const x = shaft + (flight === 0 ? 0.115 : -0.115) * end;
        for (let step = 0; step < 8; step++) {
          const z = 0.36 - (flight === 0 ? step : 7 - step) * 0.126;
          const y = bottom + flight * storey / 2 + (step + 1) * storey / 16;
          box(0.207, 0.044, 0.135, x, y - 0.022, z, tread);
          box(0.208, 0.007, 0.016, x, y - 0.002, z + 0.059, cement);
        }
        const railX = shaft + (flight === 0 ? 0.014 : -0.014) * end;
        const railY = bottom + (flight + 0.5) * storey / 2 + 0.144;
        box(0.013, 0.013, 0.924, railX, railY, -0.081, metal, flight === 0 ? 0.265 : -0.265);
        for (const step of [0, 3, 7]) {
          const z = 0.36 - (flight === 0 ? step : 7 - step) * 0.126;
          const y = bottom + flight * storey / 2 + (step + 1) * storey / 16 + 0.066;
          box(0.009, 0.132, 0.009, railX, y, z, metal);
        }
      }
    }
  }

  for (const [material, parts] of batches) {
    const mesh = new THREE.Mesh(mergeGeometries(parts), material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.place = building.name;
    building.add(mesh);
    for (const part of parts) part.dispose();
  }
  return building;
}
