import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Instance, Instances } from '@react-three/drei';
import { Color, Float32BufferAttribute, PlaneGeometry, type Group, type Mesh } from 'three';
import { Part, Round } from './models/parts';
import { bushes, flowers, FOUNTAIN_RADIUS, lamps, PLAZA_RADIUS, ROAD_WIDTH, rocks, trees } from './obstacles';
import { RING_RADIUS, WORLD_RADIUS, zones } from './zones';
import { useSurface, type Surface } from './textures';

/** Material con textura real (color, relieve y rugosidad) repetida x por y veces. */
function SurfaceMaterial({ surface, x, y, color = '#ffffff', vertexColors = false, colorMap = true }: { surface: Surface; x: number; y: number; color?: string; vertexColors?: boolean; colorMap?: boolean }) {
  const { map, ...relief } = useSurface(surface, x, y);
  // Sin colorMap solo se usa el relieve, y el color lo dan los vértices.
  const textures = colorMap ? { map, ...relief } : relief;
  return <meshStandardMaterial {...textures} color={color} vertexColors={vertexColors} roughness={1} normalScale-x={0.8} normalScale-y={0.8} />;
}

/** Ruido suave y determinista para variar alturas y colores. */
function noise(x: number, z: number) {
  return (
    Math.sin(x * 0.11 + 1.7) * Math.cos(z * 0.13 - 0.4) * 0.5 +
    Math.sin((x + z) * 0.045) * 0.3 +
    Math.cos(x * 0.31 - z * 0.27) * 0.2
  );
}

const HILLS_START = WORLD_RADIUS + 1;
const HILLS_PEAK = WORLD_RADIUS + 9;
const SHORE = WORLD_RADIUS + 20;

function terrainHeight(x: number, z: number) {
  const r = Math.hypot(x, z);
  if (r < HILLS_START) return 0;
  const n = noise(x, z) * 0.5 + 0.5;
  if (r < HILLS_PEAK) {
    const t = (r - HILLS_START) / (HILLS_PEAK - HILLS_START);
    return Math.sin((t * Math.PI) / 2) * (2 + n * 6);
  }
  const t = Math.min((r - HILLS_PEAK) / (SHORE - HILLS_PEAK), 1);
  return (1 - t) * (2 + n * 6) - t * 2.5;
}

const grassA = new Color('#7cc45a');
const grassB = new Color('#5fae4a');
const hill = new Color('#4f9a45');
const rock = new Color('#8d8a7e');
const sand = new Color('#ecd9a6');

function Terrain() {
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(SHORE * 2 + 20, SHORE * 2 + 20, 180, 180);
    geo.rotateX(-Math.PI / 2);
    const position = geo.attributes.position;
    const colors: number[] = [];
    const color = new Color();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const y = terrainHeight(x, z);
      position.setY(i, y);
      const n = noise(x * 2.3, z * 2.3) * 0.5 + 0.5;
      color.copy(grassA).lerp(grassB, n);
      if (y > 0.2) color.lerp(hill, Math.min(y / 4, 1)).lerp(rock, Math.max(0, (y - 5) / 3));
      if (y < 0.6 && Math.hypot(x, z) > HILLS_PEAK) color.copy(sand);
      colors.push(color.r, color.g, color.b);
    }
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <SurfaceMaterial surface="aerial_grass_rock" x={48} y={48} vertexColors colorMap={false} />
    </mesh>
  );
}

function Water() {
  const mesh = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(700, 700, 90, 90);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const position = geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = base[i * 3];
      const z = base[i * 3 + 2];
      position.setY(i, Math.sin(x * 0.08 + t * 0.9) * 0.18 + Math.cos(z * 0.07 + t * 0.7) * 0.18);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} geometry={geometry} position={[0, -1.1, 0]} receiveShadow>
      <meshPhysicalMaterial color="#2f9fd0" roughness={0.12} metalness={0.1} clearcoat={1} transparent opacity={0.92} />
    </mesh>
  );
}

function Dashes({ points }: { points: { x: number; z: number; rotation: number }[] }) {
  return (
    <Instances limit={points.length} receiveShadow>
      <boxGeometry args={[0.18, 0.02, 1.4]} />
      <meshStandardMaterial color="#f4d03f" roughness={0.6} />
      {points.map((point, i) => (
        <Instance key={i} position={[point.x, 0.045, point.z]} rotation={[0, point.rotation, 0]} />
      ))}
    </Instances>
  );
}

function Roads() {
  const radialDashes = useMemo(
    () =>
      zones.flatMap(({ position: [x, z], roadEnd }) => {
        const length = Math.hypot(x, z);
        const rotation = Math.atan2(x, z);
        const points = [];
        for (let d = PLAZA_RADIUS + 1.5; d < length - roadEnd - 1; d += 3) {
          if (Math.abs(d - RING_RADIUS) < ROAD_WIDTH / 2 + 0.5) continue;
          points.push({ x: (x / length) * d, z: (z / length) * d, rotation });
        }
        return points;
      }),
    [],
  );
  const ringDashes = useMemo(() => {
    const count = Math.floor((Math.PI * 2 * RING_RADIUS) / 3);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return { x: Math.sin(angle) * RING_RADIUS, z: Math.cos(angle) * RING_RADIUS, rotation: angle + Math.PI / 2 };
    });
  }, []);

  return (
    <group>
      {zones.map(({ id, position: [x, z], roadEnd }) => {
        const length = Math.hypot(x, z) - PLAZA_RADIUS - roadEnd;
        const mid = PLAZA_RADIUS + length / 2;
        const rotation = Math.atan2(x, z);
        const dirX = x / Math.hypot(x, z);
        const dirZ = z / Math.hypot(x, z);
        return (
          <group key={id} position={[dirX * mid, 0, dirZ * mid]} rotation={[0, rotation, 0]}>
            <mesh receiveShadow position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[ROAD_WIDTH, length]} />
              <SurfaceMaterial surface="asphalt_02" x={ROAD_WIDTH / 4} y={length / 4} color="#a3a6ad" />
            </mesh>
            {/* Andenes, cortados donde la calle cruza la avenida circular */}
            {[-1, 1].flatMap((side) =>
              [
                [PLAZA_RADIUS, RING_RADIUS - ROAD_WIDTH / 2],
                [RING_RADIUS + ROAD_WIDTH / 2, PLAZA_RADIUS + length],
              ].map(([from, to]) => (
                <Part key={`${side}${from}`} color="#c9c6bd" position={[side * (ROAD_WIDTH / 2 + 0.15), 0.08, (from + to) / 2 - mid]} roughness={0.9}>
                  <boxGeometry args={[0.3, 0.16, to - from]} />
                </Part>
              )),
            )}
          </group>
        );
      })}
      <mesh receiveShadow position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING_RADIUS - ROAD_WIDTH / 2, RING_RADIUS + ROAD_WIDTH / 2, 128]} />
        <SurfaceMaterial surface="asphalt_02" x={14} y={14} color="#a3a6ad" />
      </mesh>
      <Dashes points={[...radialDashes, ...ringDashes]} />
    </group>
  );
}

function Fountain() {
  const water = useRef<Mesh>(null);
  const jets = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (water.current) water.current.rotation.z = t * 0.2;
    if (jets.current) jets.current.scale.y = 1 + Math.sin(t * 3) * 0.08;
  });

  return (
    <group>
      <Part color="#e6dcc8" position={[0, 0.35, 0]} roughness={0.8}>
        <cylinderGeometry args={[FOUNTAIN_RADIUS, FOUNTAIN_RADIUS + 0.2, 0.7, 48]} />
      </Part>
      <mesh ref={water} position={[0, 0.66, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[FOUNTAIN_RADIUS - 0.3, 48]} />
        <meshPhysicalMaterial color="#5cc8f0" roughness={0.05} clearcoat={1} emissive="#1d6f9a" emissiveIntensity={0.25} />
      </mesh>
      <Part color="#d8cdb6" position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 1.6, 20]} />
      </Part>
      <Part color="#e6dcc8" position={[0, 2.15, 0]}>
        <cylinderGeometry args={[1.3, 0.5, 0.35, 32]} />
      </Part>
      <group ref={jets} position={[0, 2.3, 0]}>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.18, 1.3, 12, 1, true]} />
          <meshStandardMaterial color="#d9f3ff" transparent opacity={0.65} emissive="#9be3ff" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

function Bench(props: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={props.position} rotation={[0, props.rotation, 0]}>
      <Round size={[2.2, 0.12, 0.6]} radius={0.04} position={[0, 0.55, 0]} color="#9c6b3e" />
      <Round size={[2.2, 0.5, 0.1]} radius={0.04} position={[0, 0.9, -0.28]} rotation={[-0.15, 0, 0]} color="#9c6b3e" />
      {[-0.9, 0.9].map((x) => (
        <Round key={x} size={[0.1, 0.55, 0.55]} radius={0.03} position={[x, 0.28, 0]} color="#2d3436" metalness={0.6} roughness={0.4} />
      ))}
    </group>
  );
}

function Plaza() {
  const benches = [0.6, 2.2, 3.9, 5.4].map((angle) => ({
    position: [Math.sin(angle) * 8.4, 0, Math.cos(angle) * 8.4] as [number, number, number],
    rotation: angle + Math.PI,
  }));

  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[PLAZA_RADIUS, PLAZA_RADIUS, 0.08, 64]} />
        <SurfaceMaterial surface="concrete_floor_02" x={5} y={5} color="#efe6d4" />
      </mesh>
      {[5.2, 9.8].map((r) => (
        <mesh key={r} position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[r, r + 0.35, 64]} />
          <meshStandardMaterial color="#b9a888" roughness={0.9} />
        </mesh>
      ))}
      <Fountain />
      {benches.map((bench, i) => (
        <Bench key={i} {...bench} />
      ))}
      <WelcomeSign />
    </group>
  );
}

/** Letrero de bienvenida en la plaza. */
function WelcomeSign() {
  return (
    <group position={[-7.5, 0, 7.5]} rotation={[0, 0.5, 0]}>
      {[-1.6, 1.6].map((x) => (
        <Part key={x} color="#6d4c33" position={[x, 1.2, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 2.4, 10]} />
        </Part>
      ))}
      <Round size={[3.8, 1.2, 0.16]} radius={0.06} position={[0, 2.15, 0]} color="#fff8e7" />
      <Html transform position={[0, 2.18, 0.09]} scale={0.5} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div className="select-none whitespace-nowrap text-center font-black leading-none text-[#3d2f00]">
          <div className="text-[11px] uppercase tracking-[0.3em]">Bienvenido a</div>
          <div className="text-[26px]">El mundo de Jhon</div>
        </div>
      </Html>
      <Round size={[3.95, 0.12, 0.2]} radius={0.05} position={[0, 2.78, 0]} color="#d4af37" metalness={0.7} roughness={0.25} />
      {/* Franja tricolor de Colombia */}
      <Part color="#fcd116" position={[0, 1.6, 0]} shadow={false}>
        <boxGeometry args={[3.8, 0.12, 0.17]} />
      </Part>
      <Part color="#003893" position={[0, 1.51, 0]} shadow={false}>
        <boxGeometry args={[3.8, 0.06, 0.17]} />
      </Part>
      <Part color="#ce1126" position={[0, 1.45, 0]} shadow={false}>
        <boxGeometry args={[3.8, 0.06, 0.17]} />
      </Part>
    </group>
  );
}

const treeGreens = ['#2f7d4a', '#4caf50', '#7fb24a'];

function Trees() {
  const pines = trees.filter((tree) => tree.variant === 0);
  const rounds = trees.filter((tree) => tree.variant === 1);
  const birches = trees.filter((tree) => tree.variant === 2);
  return (
    <group>
      <Instances limit={trees.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.26, 1.6, 8]} />
        <meshStandardMaterial roughness={0.95} />
        {trees.map((tree, i) => (
          <Instance key={i} position={[tree.x, 0.8 * tree.scale, tree.z]} scale={tree.scale} color={tree.variant === 2 ? '#e8e4da' : '#6b4a2f'} />
        ))}
      </Instances>
      <Instances limit={pines.length * 3} castShadow receiveShadow>
        <coneGeometry args={[1, 1.6, 9]} />
        <meshStandardMaterial roughness={0.9} flatShading />
        {pines.flatMap((tree, i) =>
          [0, 1, 2].map((level) => (
            <Instance
              key={`${i}-${level}`}
              position={[tree.x, (1.6 + level * 0.85) * tree.scale, tree.z]}
              scale={[(1.35 - level * 0.32) * tree.scale, tree.scale, (1.35 - level * 0.32) * tree.scale]}
              rotation={[0, tree.rotation, 0]}
              color={level === 2 ? '#3d9156' : treeGreens[0]}
            />
          )),
        )}
      </Instances>
      <Instances limit={rounds.length * 3} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
        {rounds.flatMap((tree, i) =>
          [
            [0, 2.3, 0, 1.25],
            [0.6, 2.0, 0.3, 0.85],
            [-0.5, 2.6, -0.3, 0.8],
          ].map(([dx, y, dz, s], part) => (
            <Instance
              key={`${i}-${part}`}
              position={[tree.x + dx * tree.scale, y * tree.scale, tree.z + dz * tree.scale]}
              scale={s * tree.scale}
              rotation={[0, tree.rotation + part, 0]}
              color={part === 1 ? '#5cb85c' : treeGreens[1]}
            />
          )),
        )}
      </Instances>
      <Instances limit={birches.length} castShadow receiveShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial roughness={0.9} flatShading />
        {birches.map((tree, i) => (
          <Instance key={i} position={[tree.x, 2.6 * tree.scale, tree.z]} scale={[0.9 * tree.scale, 1.5 * tree.scale, 0.9 * tree.scale]} color={treeGreens[2]} />
        ))}
      </Instances>
    </group>
  );
}

const flowerColors = ['#ff6b81', '#ffd166', '#ffffff', '#c084fc'];

function Vegetation() {
  return (
    <group>
      <Instances limit={rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial roughness={1} flatShading />
        {rocks.map((rock, i) => (
          <Instance key={i} position={[rock.x, 0.25 * rock.scale, rock.z]} scale={[rock.scale, rock.scale * 0.65, rock.scale * 0.9]} rotation={[0, rock.rotation, 0]} color={rock.variant ? '#9a978c' : '#7f7c72'} />
        ))}
      </Instances>
      <Instances limit={bushes.length} castShadow receiveShadow>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
        {bushes.map((bush, i) => (
          <Instance key={i} position={[bush.x, 0.35 * bush.scale, bush.z]} scale={[bush.scale * 1.2, bush.scale * 0.8, bush.scale]} rotation={[0, bush.rotation, 0]} color={bush.variant ? '#3f8f3a' : '#56a646'} />
        ))}
      </Instances>
      <Instances limit={flowers.length} receiveShadow>
        <sphereGeometry args={[0.09, 6, 5]} />
        <meshStandardMaterial roughness={0.7} />
        {flowers.map((flower, i) => (
          <Instance key={i} position={[flower.x, 0.12, flower.z]} color={flowerColors[flower.variant]} />
        ))}
      </Instances>
    </group>
  );
}

function Lamps() {
  return (
    <group>
      <Instances limit={lamps.length} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 4.2, 10]} />
        <meshStandardMaterial color="#2d3436" metalness={0.6} roughness={0.4} />
        {lamps.map((lamp, i) => (
          <Instance key={i} position={[lamp.x, 2.1, lamp.z]} />
        ))}
      </Instances>
      <Instances limit={lamps.length} castShadow>
        <boxGeometry args={[1.1, 0.08, 0.08]} />
        <meshStandardMaterial color="#2d3436" metalness={0.6} roughness={0.4} />
        {lamps.map((lamp, i) => (
          <Instance key={i} position={[lamp.x + Math.cos(lamp.rotation) * 0.5, 4.15, lamp.z - Math.sin(lamp.rotation) * 0.5]} rotation={[0, lamp.rotation, 0]} />
        ))}
      </Instances>
      <Instances limit={lamps.length}>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color="#fff4d6" emissive="#ffd88a" emissiveIntensity={1.6} />
        {lamps.map((lamp, i) => (
          <Instance key={i} position={[lamp.x + Math.cos(lamp.rotation) * 1, 3.95, lamp.z - Math.sin(lamp.rotation) * 1]} />
        ))}
      </Instances>
    </group>
  );
}

function Clouds() {
  const group = useRef<Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + i;
        const radius = 60 + (i % 4) * 35;
        return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, y: 70 + (i % 3) * 8, scale: 3 + (i % 3) };
      }),
    [],
  );
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.006;
  });

  return (
    <group ref={group}>
      {clouds.map((cloud, i) => (
        <group key={i} position={[cloud.x, cloud.y, cloud.z]} scale={cloud.scale}>
          {[
            [0, 0, 0, 1.6],
            [1.6, -0.2, 0.2, 1.2],
            [-1.5, -0.3, -0.1, 1.1],
            [0.5, 0.6, -0.4, 1.1],
          ].map(([x, y, z, s], part) => (
            <mesh key={part} position={[x, y, z]} scale={[s, s * 0.75, s]}>
              <sphereGeometry args={[1, 14, 10]} />
              <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.15} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Islas pequeñas en el horizonte para dar profundidad. */
function DistantIslands() {
  const islands = [
    { x: -150, z: -120, s: 14 },
    { x: 170, z: -60, s: 18 },
    { x: 120, z: 160, s: 12 },
    { x: -180, z: 90, s: 16 },
  ];
  return (
    <group>
      {islands.map((island, i) => (
        <Part key={i} color="#5a9a55" position={[island.x, -1, island.z]} scale={[island.s, island.s * 0.45, island.s]} flat shadow={false}>
          <icosahedronGeometry args={[1, 1]} />
        </Part>
      ))}
    </group>
  );
}

/** Isla, agua, plaza, calles y vegetación. */
export function Island() {
  return (
    <group>
      <Terrain />
      <Water />
      <Roads />
      <Plaza />
      <Trees />
      <Vegetation />
      <Lamps />
      <Clouds />
      <DistantIslands />
    </group>
  );
}
