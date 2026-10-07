import { facingCenter, RING_RADIUS, WORLD_RADIUS, zoneById, zones, type ZoneId } from './zones';

export type Obstacle = { x: number; z: number; r: number };

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export const PLAZA_RADIUS = 12;
export const FOUNTAIN_RADIUS = 3.4;
export const ROAD_WIDTH = 6;

/** Distancia de un punto a la calle recta entre la plaza y una zona. */
function distanceToRoad(x: number, z: number, [zx, zz]: [number, number]) {
  const lengthSq = zx * zx + zz * zz;
  const t = Math.max(0, Math.min(1, (x * zx + z * zz) / lengthSq));
  return Math.hypot(x - zx * t, z - zz * t);
}

/** Convierte coordenadas locales de una zona (mirando a la plaza) a coordenadas del mundo. */
export function zoneToWorld(id: ZoneId, lx: number, lz: number): [number, number] {
  const [px, pz] = zoneById[id].position;
  const angle = facingCenter([px, pz]);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [px + lx * cos + lz * sin, pz - lx * sin + lz * cos];
}

function isFree(x: number, z: number, margin: number) {
  const r = Math.hypot(x, z);
  if (r < PLAZA_RADIUS + margin || r > WORLD_RADIUS - 2) return false;
  if (Math.abs(r - RING_RADIUS) < ROAD_WIDTH / 2 + margin) return false;
  if (zones.some((zone) => distanceToRoad(x, z, zone.position) < ROAD_WIDTH / 2 + margin)) return false;
  return !zones.some((zone) => Math.hypot(x - zone.position[0], z - zone.position[1]) < zone.triggerRadius + 5 + margin);
}

export type Scatter = { x: number; z: number; scale: number; rotation: number; variant: number };

function scatter(seed: number, count: number, margin: number, spacing: number, variants = 1): Scatter[] {
  const random = seeded(seed);
  const items: Scatter[] = [];
  let attempts = 0;
  while (items.length < count && attempts < count * 60) {
    attempts++;
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * WORLD_RADIUS;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    if (!isFree(x, z, margin)) continue;
    if (items.some((item) => Math.hypot(x - item.x, z - item.z) < spacing)) continue;
    items.push({ x, z, scale: 0.75 + random() * 0.7, rotation: random() * Math.PI * 2, variant: Math.floor(random() * variants) });
  }
  return items;
}

export const trees = scatter(7, 190, 1.5, 3.4, 3);
export const rocks = scatter(11, 45, 0.8, 2.5, 2);
export const bushes = scatter(19, 120, 0.6, 1.6, 2);
export const flowers = scatter(23, 420, 0.2, 0.6, 4);

/** Faroles alternando lados de cada calle radial. */
export const lamps: { x: number; z: number; rotation: number }[] = zones.flatMap(({ position: [zx, zz] }) => {
  const length = Math.hypot(zx, zz);
  const dirX = zx / length;
  const dirZ = zz / length;
  const items: { x: number; z: number; rotation: number }[] = [];
  const offset = ROAD_WIDTH / 2 + 0.9;
  for (let d = PLAZA_RADIUS + 4, side = 1; d < length - 12; d += 9, side *= -1) {
    if (Math.abs(d - RING_RADIUS) < ROAD_WIDTH) continue;
    // El brazo del farol apunta hacia la calle.
    items.push({ x: dirX * d - dirZ * offset * side, z: dirZ * d + dirX * offset * side, rotation: Math.atan2(dirX * side, dirZ * side) });
  }
  return items;
});

/** Posición del Kia Rio: estacionado frente al garaje, a la vista. */
export const carSpot = { local: [2.3, 6.4] as [number, number], rotation: 0 };

const [gx, gz] = zoneById.proyectos.position;
const [mx, mz] = zoneById['sobre-mi'].position;
const [cx, cz] = zoneToWorld('contacto', -1.3, -0.8);
// El carro se aproxima con dos círculos (frente y cola) para dejar libre la entrada.
const carFront = zoneToWorld('contacto', carSpot.local[0], carSpot.local[1] + 1.1);
const carBack = zoneToWorld('contacto', carSpot.local[0], carSpot.local[1] - 1.1);

export const obstacles: Obstacle[] = [
  { x: 0, z: 0, r: FOUNTAIN_RADIUS },
  { x: gx, z: gz, r: 6 },
  { x: mx, z: mz, r: 6 },
  { x: cx, z: cz, r: 4.6 },
  { x: carFront[0], z: carFront[1], r: 1 },
  { x: carBack[0], z: carBack[1], r: 1 },
  // Postes del letrero de bienvenida
  { x: -6.1, z: 6.73, r: 0.4 },
  { x: -8.9, z: 8.27, r: 0.4 },
  ...trees.map((tree) => ({ x: tree.x, z: tree.z, r: 0.6 * tree.scale })),
  ...rocks.map((rock) => ({ x: rock.x, z: rock.z, r: 0.9 * rock.scale })),
  ...lamps.map((lamp) => ({ x: lamp.x, z: lamp.z, r: 0.25 })),
];

if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__zoneToWorld = zoneToWorld;
}
