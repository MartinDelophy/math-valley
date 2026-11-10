import * as THREE from 'three';
import { observe, period } from './math.js';

export function buildClocktower(K, level) {
  const { world, cyl, box, materials: M } = K;
  K.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 1.5));
  const actor = K.makeTraveler(world);
  const cycle = period(level);
  const hit = [];
  const labels = [];
  const radius = 4.6;

  function pointAt(tick) {
    const angle = tick * Math.PI * 2 / cycle;
    return new THREE.Vector3(radius * Math.sin(angle), 1.16, radius * Math.cos(angle));
  }

  function label(text, position, width = .66) {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 96;
    const ink = canvas.getContext('2d');
    ink.fillStyle = '#342549';
    ink.beginPath();
    ink.roundRect(8, 7, 144, 82, 22);
    ink.fill();
    ink.font = 'bold 52px Georgia';
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    ink.fillStyle = '#ffeac1';
    ink.fillText(text, 80, 50);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false }));
    sprite.position.copy(position);
    sprite.scale.set(width, width * .6, 1);
    world.add(sprite);
    labels.push(sprite);
  }

  cyl(world, 0, .15, 0, 5.45, .3, M.stone);
  cyl(world, 0, .42, 0, 5.16, .24, M.trim);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, .17, 12, 96), M.gold);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = .91;
  world.add(ring);
  const ticks = Array.from({ length: cycle }, (_, tick) => {
    const p = pointAt(tick);
    cyl(world, p.x, .73, p.z, .43, .42, M.cream, 18);
    const cap = cyl(world, p.x, 1.02, p.z, .53, .26, M.paving, 24);
    label(String(tick), p.clone().add(new THREE.Vector3(0, .35, 0)));
    return cap;
  });

  cyl(world, 0, 1.52, -1.65, 1.02, 2.55, M.cream, 12);
  cyl(world, 0, 2.79, -1.65, 1.26, .22, M.gold, 12);
  K.makeHouse(world, new THREE.Vector3(0, 2.91, -1.65));
  const gate = box(world, 0, 2.17, -.59, .64, .77, .16, M.teal, .04);

  const dials = level.moduli.map((n, index) => {
    const x = level.moduli.length === 1 ? 0 : index === 0 ? -2.15 : 2.15;
    const y = 1.72;
    const z = .55;
    cyl(world, x, .94, z, .63, 1.45, M.cream, 12);
    cyl(world, x, y, z, 1.35, .17, M.trim, 36);
    label(`÷${n}`, new THREE.Vector3(x, 2.35, z), .91);
    const dots = Array.from({ length: n }, (_, i) => {
      const angle = i * Math.PI * 2 / n;
      return cyl(world, x + 1.03 * Math.sin(angle), y + .12, z + 1.03 * Math.cos(angle),
        .14, .11, i === level.residues[index] ? M.gold : M.stone, 14);
    });
    return dots;
  });

  level.actions.forEach((amount, index) => {
    const x = (index - (level.actions.length - 1) / 2) * .9;
    const z = 2.68;
    cyl(world, x, .67, z, .34, .28, M.cream, 16);
    const key = cyl(world, x, .88, z, .34, .22, M.gold, 18);
    key.userData.expansionAction = ['jump', amount];
    hit.push(key);
    label(amount > 0 ? `+${amount}` : String(amount), new THREE.Vector3(x, 1.22, z), .55);
  });

  K.fitWorld();
  return {
    hit,
    actor,
    point: state => pointAt(state.x),
    dispose() {
      for (const { material } of labels) {
        material.map.dispose();
        material.dispose();
      }
    },
    motionPoint: (state, amount, progress) => pointAt(state.x + amount * progress),
    update(state, _view, solved) {
      actor.traveler.position.copy(pointAt(state.x));
      ticks.forEach((tick, index) => { tick.material = index === state.x ? M.gold : M.paving; });
      observe(level, state.x).forEach(({ residue, target, matches }, index) => {
        dials[index].forEach((dot, i) => {
          dot.material = i === residue ? (matches ? M.teal : M.cream) : i === target ? M.gold : M.stone;
        });
      });
      gate.visible = !solved;
      ring.material = solved ? M.teal : M.gold;
    },
  };
}
