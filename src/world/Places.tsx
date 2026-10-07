import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ExtrudeGeometry, MathUtils, Shape, type Group, type Mesh, type MeshStandardMaterial } from 'three';
import { Car } from './models/Car';
import { Pet, type PetColors } from './models/Pet';
import { Capsule, Part, Round } from './models/parts';
import { carSpot } from './obstacles';
import { openZone, useWorld } from './store';
import { facingCenter, zoneById, type ZoneId } from './zones';

const RM_WHITE = '#f7f7f2';
const RM_GOLD = '#d4af37';
const GLASS = { color: '#1d2b3a', metalness: 0.9, roughness: 0.06, clearcoat: 1 };
const WOOD = { color: '#9c6b3e', roughness: 0.85 };
const STEEL = { color: '#3a3f45', metalness: 0.7, roughness: 0.35 };

function ZoneLabel({ id, height }: { id: ZoneId; height: number }) {
  const zone = zoneById[id];
  const visited = useWorld((s) => s.visited.includes(id));
  return (
    <Html position={[0, height, 0]} center zIndexRange={[20, 0]}>
      <button
        onClick={() => openZone(id)}
        className="flex flex-col items-center whitespace-nowrap rounded-2xl bg-white/90 px-4 py-2 text-gray-900 shadow-xl backdrop-blur transition hover:scale-110"
      >
        <span className="text-sm font-bold sm:text-base">
          {zone.emoji} {zone.place} {visited && '✓'}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{zone.section}</span>
      </button>
    </Html>
  );
}

/** Coloca un lugar en su zona, de frente a la plaza. */
function Place({ id, labelHeight, children }: { id: ZoneId; labelHeight: number; children: ReactNode }) {
  const { position } = zoneById[id];
  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, facingCenter(position), 0]}>
      {children}
      <ZoneLabel id={id} height={labelHeight} />
    </group>
  );
}

/** Texto plano pegado a una superficie. */
function Sign({ position, scale = 0.5, children }: { position: [number, number, number]; scale?: number; children: ReactNode }) {
  return (
    <Html transform position={position} scale={scale} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className="select-none whitespace-nowrap">{children}</div>
    </Html>
  );
}

function ColombiaFlag(props: { position: [number, number, number] }) {
  const flag = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (flag.current) flag.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.12;
  });
  return (
    <group {...props}>
      <Part {...STEEL} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 5, 10]} />
      </Part>
      <group ref={flag} position={[0, 4.4, 0]}>
        <Round size={[1.5, 0.5, 0.03]} radius={0.01} position={[0.78, 0.25, 0]} color="#fcd116" />
        <Round size={[1.5, 0.25, 0.03]} radius={0.01} position={[0.78, -0.12, 0]} color="#003893" />
        <Round size={[1.5, 0.25, 0.03]} radius={0.01} position={[0.78, -0.37, 0]} color="#ce1126" />
      </group>
    </group>
  );
}

type GableRoofProps = {
  width: number;
  /** Altura del triángulo del techo sobre las paredes. */
  rise: number;
  depth: number;
  baseY: number;
  z: number;
  wallColor: string;
  roofColor: string;
};

/** Techo a dos aguas cerrado: hastiales triangulares, dos faldones con alero y caballete. */
function GableRoof({ width, rise, depth, baseY, z, wallColor, roofColor }: GableRoofProps) {
  const gable = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-width / 2, 0);
    shape.lineTo(width / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }, [width, rise, depth]);

  const overhang = 0.35;
  const thickness = 0.16;
  const slope = Math.atan2(rise, width / 2);
  const length = Math.hypot(width / 2, rise) + overhang;

  return (
    <group position={[0, baseY, z]}>
      <mesh geometry={gable} castShadow receiveShadow>
        <meshStandardMaterial color={wallColor} roughness={0.85} />
      </mesh>
      {[-1, 1].map((side) => (
        <Round
          key={side}
          size={[length, thickness, depth + overhang * 2]}
          radius={0.05}
          position={[
            side * (width / 4 + (overhang / 2) * Math.cos(slope)) + side * Math.sin(slope) * (thickness / 2),
            rise / 2 - (overhang / 2) * Math.sin(slope) + Math.cos(slope) * (thickness / 2),
            0,
          ]}
          rotation={[0, 0, -side * slope]}
          color={roofColor}
          roughness={0.7}
        />
      ))}
      <Capsule radius={0.11} length={depth + overhang * 2} position={[0, rise + thickness * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} color={roofColor} roughness={0.6} />
    </group>
  );
}

function Window({ position, size, glow = '#000000' }: { position: [number, number, number]; size: [number, number]; glow?: string }) {
  return (
    <group position={position}>
      <Round size={[size[0] + 0.16, size[1] + 0.16, 0.12]} radius={0.04} color="#f2efe8" />
      <Round size={[size[0], size[1], 0.14]} radius={0.03} {...GLASS} emissive={glow} emissiveIntensity={0.6} />
      <Round size={[0.05, size[1], 0.16]} radius={0.02} color="#f2efe8" shadow={false} />
    </group>
  );
}

function GamerRoom() {
  const screens = useRef<Mesh[]>([]);
  const strip = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    screens.current.forEach((screen, i) => {
      (screen.material as MeshStandardMaterial).emissiveIntensity = 1.5 + Math.sin(t * 3 + i * 2) * 0.5;
    });
    strip.current?.emissive.setHSL((t * 0.08) % 1, 0.9, 0.55);
  });

  return (
    <Place id="proyectos" labelHeight={9}>
      {/* Casa de dos niveles */}
      <Round size={[9, 3.4, 7]} radius={0.18} position={[0, 1.7, -0.6]} color="#3b2f63" roughness={0.8} />
      <Round size={[6, 2.6, 5.5]} radius={0.18} position={[-1.3, 4.7, -1.2]} color="#2c2350" roughness={0.8} />
      <Round size={[9.4, 0.3, 7.4]} radius={0.1} position={[0, 3.5, -0.6]} color="#1f1838" />
      <Round size={[6.4, 0.3, 5.9]} radius={0.1} position={[-1.3, 6.1, -1.2]} color="#1f1838" />
      {/* Tira LED que cambia de color */}
      <mesh position={[0, 3.32, 2.92]}>
        <boxGeometry args={[9.3, 0.08, 0.08]} />
        <meshStandardMaterial ref={strip} color="#ffffff" emissive="#ff2bd6" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <Window position={[-2.4, 1.9, 2.92]} size={[3, 1.6]} glow="#7c3aed" />
      <Window position={[-1.3, 4.8, 1.56]} size={[2.4, 1.2]} glow="#22d3ee" />
      <Round size={[1.3, 2.5, 0.14]} radius={0.05} position={[2.6, 1.25, 2.92]} color="#15102b" />
      <Part color={RM_GOLD} position={[2.15, 1.25, 3.02]} metalness={0.9} roughness={0.2}>
        <sphereGeometry args={[0.06, 10, 8]} />
      </Part>
      {/* Botón de play en el techo, por los días de youtuber */}
      <group position={[2.6, 4.9, 0.2]} rotation={[0, -0.25, 0]}>
        <Round size={[2.8, 1.95, 0.4]} radius={0.45} color="#ff0033" roughness={0.4} />
        <Part color="#ffffff" position={[0.08, 0, 0.22]} rotation={[Math.PI / 2, Math.PI / 2, 0]} shadow={false}>
          <cylinderGeometry args={[0.5, 0.5, 0.06, 3]} />
        </Part>
        <Round size={[0.12, 1.2, 0.12]} radius={0.04} position={[0, -1.4, -0.1]} {...STEEL} />
      </group>
      {/* Antena */}
      <group position={[-3.4, 6.4, -2.6]}>
        <Part {...STEEL} position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
        </Part>
        <Part color="#d8d8d8" position={[0, 1.1, 0.1]} rotation={[-0.9, 0, 0]} metalness={0.5}>
          <sphereGeometry args={[0.45, 20, 10, 0, Math.PI * 2, 0, 1.1]} />
        </Part>
      </group>
      {/* Terraza de madera con el setup */}
      <Round size={[6.5, 0.2, 2.6]} radius={0.06} position={[-0.8, 0.1, 4.2]} {...WOOD} />
      <group position={[-1.2, 0.2, 4]}>
        <Round size={[3.2, 0.1, 1]} radius={0.04} position={[0, 0.82, 0]} color="#18181c" />
        {[-1.45, 1.45].map((x) => (
          <Round key={x} size={[0.08, 0.82, 0.9]} radius={0.03} position={[x, 0.41, 0]} color="#18181c" />
        ))}
        {[-1, 0, 1].map((x, i) => (
          <group key={x} position={[x, 1.35, -0.25]} rotation={[0, -x * 0.35, 0]}>
            <Round size={[0.95, 0.58, 0.06]} radius={0.03} color="#0d0d10" />
            <mesh
              position={[0, 0, 0.035]}
              ref={(el) => {
                if (el) screens.current[i] = el;
              }}
            >
              <planeGeometry args={[0.87, 0.5]} />
              <meshStandardMaterial color="#0f172a" emissive={['#22d3ee', '#a855f7', '#22c55e'][i]} emissiveIntensity={1.5} toneMapped={false} />
            </mesh>
            <Capsule radius={0.025} length={0.3} position={[0, -0.42, -0.02]} color="#0d0d10" />
          </group>
        ))}
        <Round size={[0.9, 0.04, 0.3]} radius={0.02} position={[0, 0.89, 0.25]} color="#1f1f25" emissive="#5b21b6" emissiveIntensity={0.6} />
        {/* Silla gamer */}
        <group position={[0, 0, 1.05]} rotation={[0, Math.PI, 0]}>
          <Round size={[0.72, 0.16, 0.7]} radius={0.07} position={[0, 0.62, 0]} color="#111" />
          <Round size={[0.68, 1.2, 0.16]} radius={0.1} position={[0, 1.25, 0.33]} rotation={[-0.12, 0, 0]} color="#111" />
          <Round size={[0.3, 1.0, 0.17]} radius={0.06} position={[0, 1.28, 0.34]} rotation={[-0.12, 0, 0]} color="#ff2bd6" />
          <Part color="#333" position={[0, 0.3, 0]} metalness={0.8}>
            <cylinderGeometry args={[0.05, 0.05, 0.6, 10]} />
          </Part>
          <Part color="#222" position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.35, 0.35, 0.06, 5]} />
          </Part>
        </group>
      </group>
    </Place>
  );
}

function Floodlight(props: { position: [number, number, number] }) {
  return (
    <group {...props}>
      <Part {...STEEL} position={[0, 4, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 8, 10]} />
      </Part>
      <Round size={[1.6, 0.9, 0.25]} radius={0.06} position={[0, 8.2, 0]} rotation={[0.5, 0, 0]} {...STEEL} />
      <Round size={[1.4, 0.7, 0.05]} radius={0.04} position={[0, 8.24, 0.13]} rotation={[0.5, 0, 0]} color="#ffffff" emissive="#fff8e1" emissiveIntensity={2} shadow={false} />
    </group>
  );
}

function Goal({ x }: { x: number }) {
  const dir = Math.sign(x);
  return (
    <group position={[x, 0, 0]}>
      {[1.8, -1.8].map((z) => (
        <Part key={z} color="#ffffff" position={[0, 1.1, z]}>
          <cylinderGeometry args={[0.07, 0.07, 2.2, 10]} />
        </Part>
      ))}
      <Part color="#ffffff" position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 3.75, 10]} />
      </Part>
      <mesh position={[dir * 0.7, 1.1, 0]}>
        <boxGeometry args={[1.4, 2.2, 3.6, 6, 8, 12]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function Pitch() {
  const ball = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ball.current) return;
    const t = clock.elapsedTime;
    ball.current.position.set(Math.sin(t * 0.7) * 5, 0.32 + Math.abs(Math.sin(t * 2.5)) * 1.2, Math.cos(t * 0.5) * 2);
    ball.current.rotation.x = t * 3;
  });

  const W = 24;
  const H = 15;
  const lines: { size: [number, number, number]; position: [number, number, number] }[] = [
    { size: [W, 0.02, 0.14], position: [0, 0.1, H / 2] },
    { size: [W, 0.02, 0.14], position: [0, 0.1, -H / 2] },
    { size: [0.14, 0.02, H], position: [W / 2, 0.1, 0] },
    { size: [0.14, 0.02, H], position: [-W / 2, 0.1, 0] },
    { size: [0.14, 0.02, H], position: [0, 0.1, 0] },
    ...[1, -1].flatMap((side) => [
      { size: [3.4, 0.02, 0.14] as [number, number, number], position: [side * (W / 2 - 1.7), 0.1, 3.6] as [number, number, number] },
      { size: [3.4, 0.02, 0.14] as [number, number, number], position: [side * (W / 2 - 1.7), 0.1, -3.6] as [number, number, number] },
      { size: [0.14, 0.02, 7.2] as [number, number, number], position: [side * (W / 2 - 3.4), 0.1, 0] as [number, number, number] },
    ]),
  ];

  return (
    <Place id="habilidades" labelHeight={10}>
      <Round size={[W + 3, 0.12, H + 3]} radius={0.05} position={[0, 0.03, 0]} color="#2d8a3e" roughness={0.95} shadow={false} />
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-W / 2 + 1 + i * 2, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2, H]} />
          <meshStandardMaterial color={i % 2 ? '#3fa552' : '#379a4a'} roughness={0.95} />
        </mesh>
      ))}
      {lines.map((line, i) => (
        <mesh key={i} position={line.position}>
          <boxGeometry args={line.size} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.34, 48]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <Goal x={W / 2} />
      <Goal x={-W / 2} />
      <group ref={ball}>
        <Part color="#ffffff" roughness={0.4}>
          <icosahedronGeometry args={[0.3, 2]} />
        </Part>
        <Part color="#111" scale={1.01} roughness={0.4} flat>
          <icosahedronGeometry args={[0.3, 0]} />
        </Part>
      </group>
      {/* Tribuna blanca con sillas doradas */}
      <group position={[0, 0, -H / 2 - 2.6]}>
        {[0, 1, 2, 3].map((step) => (
          <group key={step}>
            <Round size={[20, 0.55 * (step + 1), 1.1]} radius={0.06} position={[0, 0.275 * (step + 1), -step * 1.1]} color={RM_WHITE} />
            <Round size={[19.6, 0.22, 0.45]} radius={0.08} position={[0, 0.6 + step * 0.55, -step * 1.1 - 0.15]} color={step === 2 ? '#2f4fbf' : RM_GOLD} metalness={0.3} roughness={0.45} />
          </group>
        ))}
        <Round size={[20.4, 0.25, 5]} radius={0.08} position={[0, 4.4, -1.8]} rotation={[0.12, 0, 0]} color={RM_WHITE} />
        {[-9.8, 9.8].map((x) => (
          <Round key={x} size={[0.25, 4.4, 0.25]} radius={0.06} position={[x, 2.2, -3.6]} {...STEEL} />
        ))}
      </group>
      {/* Marcador */}
      <group position={[-8, 0, H / 2 + 3.2]} rotation={[0, 0.25, 0]}>
        {[-1.6, 1.6].map((x) => (
          <Round key={x} size={[0.2, 3, 0.2]} radius={0.05} position={[x, 1.5, 0]} {...STEEL} />
        ))}
        <Round size={[4.2, 1.6, 0.3]} radius={0.1} position={[0, 3.6, 0]} color="#101418" />
        <Sign position={[0, 3.6, 0.17]} scale={0.45}>
          <div className="font-mono text-[30px] font-black tracking-wider text-amber-300">JHON 10 · 0 BUGS</div>
        </Sign>
      </group>
      <Floodlight position={[-W / 2 - 2, 0, -H / 2 - 1]} />
      <Floodlight position={[W / 2 + 2, 0, -H / 2 - 1]} />
      <ColombiaFlag position={[-W / 2 - 1.5, 0, H / 2 + 1]} />
      <ColombiaFlag position={[W / 2 + 1.5, 0, H / 2 + 1]} />
    </Place>
  );
}

function Barbell(props: { position: [number, number, number] }) {
  return (
    <group {...props}>
      <Capsule radius={0.03} length={2.2} rotation={[0, 0, Math.PI / 2]} color="#c9ccd1" metalness={0.9} roughness={0.25} />
      {[0.8, -0.8, 0.95, -0.95].map((x, i) => (
        <Part key={x} color={i < 2 ? '#d62828' : '#111'} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} roughness={0.6}>
          <cylinderGeometry args={[i < 2 ? 0.34 : 0.26, i < 2 ? 0.34 : 0.26, 0.1, 28]} />
        </Part>
      ))}
    </group>
  );
}

function Dumbbell(props: { position: [number, number, number]; color: string }) {
  return (
    <group {...props} rotation={[0, Math.PI / 2, 0]}>
      <Capsule radius={0.025} length={0.32} rotation={[0, 0, Math.PI / 2]} color="#c9ccd1" metalness={0.9} roughness={0.25} />
      {[0.2, -0.2].map((x) => (
        <Part key={x} color={props.color} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]} roughness={0.5}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 6]} />
        </Part>
      ))}
    </group>
  );
}

function Gym() {
  return (
    <Place id="sobre-mi" labelHeight={8}>
      <Round size={[9, 4, 7]} radius={0.2} position={[0, 2, -0.6]} color="#e9e6e1" roughness={0.8} />
      <Round size={[9.2, 0.6, 7.2]} radius={0.15} position={[0, 4.2, -0.6]} color="#2b2f36" />
      <Round size={[9.06, 0.5, 7.06]} radius={0.15} position={[0, 0.9, -0.6]} color="#ff6b35" />
      {/* Fachada de vidrio */}
      <Round size={[6, 2.8, 0.12]} radius={0.05} position={[-0.6, 2.1, 2.92]} {...GLASS} emissive="#ffb37a" emissiveIntensity={0.15} />
      {[-3.6, -1.6, 0.4, 2.4].map((x) => (
        <Round key={x} size={[0.12, 2.9, 0.16]} radius={0.04} position={[x, 2.1, 2.94]} {...STEEL} />
      ))}
      <Round size={[6.1, 0.12, 0.16]} radius={0.04} position={[-0.6, 3.5, 2.94]} {...STEEL} />
      <Round size={[1.3, 2.5, 0.14]} radius={0.05} position={[3.4, 1.25, 2.92]} {...STEEL} />
      {/* Letrero */}
      <Round size={[4.6, 1.1, 0.25]} radius={0.12} position={[0, 5.2, 1.6]} color="#111827" />
      <Sign position={[0, 5.2, 1.74]} scale={0.6}>
        <div className="text-[40px] font-black tracking-[0.25em] text-orange-400 [text-shadow:0_0_12px_rgba(251,146,60,0.9)]">GYM</div>
      </Sign>
      {/* Zona de pesas al aire libre */}
      <Round size={[8, 0.08, 3.4]} radius={0.04} position={[0, 0.06, 4.6]} color="#2f3238" roughness={0.95} />
      <group position={[-2.4, 0, 4.4]}>
        <Round size={[0.45, 0.14, 1.5]} radius={0.06} position={[0, 0.55, 0]} color="#1f2937" />
        <Round size={[0.08, 0.5, 0.08]} radius={0.03} position={[0, 0.25, 0.5]} {...STEEL} />
        <Round size={[0.08, 0.5, 0.08]} radius={0.03} position={[0, 0.25, -0.5]} {...STEEL} />
        {[-0.6, 0.6].map((x) => (
          <Round key={x} size={[0.08, 1.3, 0.08]} radius={0.03} position={[x, 0.65, -0.65]} {...STEEL} />
        ))}
        <Barbell position={[0, 1.3, -0.65]} />
      </group>
      <group position={[1.2, 0, 4.4]}>
        <Round size={[2.2, 0.08, 0.6]} radius={0.03} position={[0, 0.7, 0]} {...STEEL} />
        <Round size={[2.2, 0.08, 0.6]} radius={0.03} position={[0, 0.35, 0]} {...STEEL} />
        {[-0.8, -0.27, 0.27, 0.8].map((x, i) => (
          <Dumbbell key={x} position={[x, 0.85, 0]} color={['#ff6b35', '#2f4fbf', '#ff6b35', '#2f4fbf'][i]} />
        ))}
        {[-1.05, 1.05].map((x) => (
          <Round key={x} size={[0.08, 0.8, 0.5]} radius={0.03} position={[x, 0.4, 0]} {...STEEL} />
        ))}
      </group>
      {/* Barra de dominadas */}
      <group position={[3.4, 0, 4.6]}>
        {[-0.7, 0.7].map((x) => (
          <Round key={x} size={[0.1, 2.6, 0.1]} radius={0.04} position={[x, 1.3, 0]} {...STEEL} />
        ))}
        <Capsule radius={0.03} length={1.4} position={[0, 2.55, 0]} rotation={[0, 0, Math.PI / 2]} color="#c9ccd1" metalness={0.9} />
      </group>
    </Place>
  );
}

type Wanderer = { kind: 'dog' | 'cat'; colors: PetColors; radius: number; speed: number; offset: number; center: [number, number] };

function WanderingPet({ pet }: { pet: Wanderer }) {
  const group = useRef<Group>(null);
  const speed = useRef(0);
  const motion = useRef({ angle: pet.offset, walking: 1 });

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    const m = motion.current;
    // Camina un rato y descansa otro, cada uno a su ritmo.
    const wantsToWalk = Math.sin(clock.elapsedTime * 0.32 + pet.offset * 1.7) > -0.35 ? 1 : 0;
    m.walking = MathUtils.damp(m.walking, wantsToWalk, 3, dt);
    m.angle += pet.speed * m.walking * dt;
    speed.current = Math.abs(pet.speed * pet.radius) * 2 * m.walking;
    group.current.position.set(pet.center[0] + Math.cos(m.angle) * pet.radius, 0, pet.center[1] + Math.sin(m.angle) * pet.radius);
    // Mira en la dirección en que avanza sobre el círculo.
    const direction = Math.sign(pet.speed);
    group.current.rotation.y = Math.atan2(-Math.sin(m.angle) * direction, Math.cos(m.angle) * direction);
  });

  return (
    <group ref={group}>
      <Pet kind={pet.kind} colors={pet.colors} speed={speed} seed={pet.offset} />
    </group>
  );
}

function Doghouse(props: { position: [number, number, number]; color: string; rotation?: number }) {
  return (
    <group position={props.position} rotation={[0, props.rotation ?? 0, 0]}>
      <Round size={[1.6, 1.2, 1.8]} radius={0.08} position={[0, 0.6, 0]} color={props.color} />
      {[-1, 1].map((side) => (
        <Round key={side} size={[1.05, 0.12, 2.1]} radius={0.05} position={[side * 0.42, 1.5, 0]} rotation={[0, 0, side * -0.75]} color="#8c3b1f" />
      ))}
      <Part color="#1c1917" position={[0, 0.45, 0.91]} shadow={false}>
        <circleGeometry args={[0.36, 24, 0, Math.PI]} />
      </Part>
      <Round size={[0.72, 0.45, 0.02]} radius={0.01} position={[0, 0.23, 0.91]} color="#1c1917" shadow={false} />
    </group>
  );
}

function Shelter() {
  const pets = useMemo<Wanderer[]>(
    () => [
      { kind: 'dog', colors: { body: '#f2d7a6', belly: '#fbead0' }, radius: 3, speed: 0.55, offset: 0, center: [0, 0.5] },
      { kind: 'dog', colors: { body: '#3f2a1d', muzzle: '#c08a5b', belly: '#c08a5b' }, radius: 4.2, speed: -0.4, offset: 2, center: [0, 0.5] },
      { kind: 'dog', colors: { body: '#f5f5f5', saddle: '#2b2b2b' }, radius: 2, speed: 0.7, offset: 4, center: [-3, 2.5] },
      { kind: 'cat', colors: { body: '#f59e0b', belly: '#fde7c2' }, radius: 1.4, speed: 0.8, offset: 1, center: [-4, -2] },
      { kind: 'cat', colors: { body: '#e5e7eb', saddle: '#4b5563' }, radius: 1.2, speed: -0.7, offset: 3, center: [4, -2.2] },
      { kind: 'cat', colors: { body: '#1f2937', belly: '#f3f4f6' }, radius: 1, speed: 0.5, offset: 4, center: [3.8, 2.6] },
    ],
    [],
  );

  const posts: [number, number][] = [];
  for (let x = -7; x <= 7; x += 1.75) posts.push([x, -5.5]);
  for (let z = -3.75; z <= 5.5; z += 1.75) posts.push([-7, z], [7, z]);

  return (
    <Place id="fundacion" labelHeight={7}>
      <Round size={[14.5, 0.08, 11.5]} radius={0.04} position={[0, 0.04, 0]} color="#9ed36a" roughness={0.95} shadow={false} />
      {posts.map(([x, z]) => (
        <Round key={`${x},${z}`} size={[0.18, 1.1, 0.18]} radius={0.05} position={[x, 0.55, z]} {...WOOD} />
      ))}
      {[0.45, 0.85].map((y) => (
        <group key={y}>
          <Round size={[14.2, 0.1, 0.08]} radius={0.03} position={[0, y, -5.5]} {...WOOD} />
          <Round size={[0.08, 0.1, 9.4]} radius={0.03} position={[-7, y, 0.2]} {...WOOD} />
          <Round size={[0.08, 0.1, 9.4]} radius={0.03} position={[7, y, 0.2]} {...WOOD} />
        </group>
      ))}
      <Doghouse position={[-4.6, 0, -3.6]} color="#fde68a" rotation={0.3} />
      <Doghouse position={[4.6, 0, -3.6]} color="#bfdbfe" rotation={-0.3} />
      {/* Casa del refugio con letrero */}
      <Round size={[4.2, 2.6, 2.6]} radius={0.12} position={[0, 1.3, -4]} color="#fff4e0" />
      <GableRoof width={4.2} rise={1.3} depth={2.6} baseY={2.6} z={-4} wallColor="#fff4e0" roofColor="#c2410c" />
      <Round size={[1, 1.7, 0.1]} radius={0.04} position={[0, 0.85, -2.66]} {...WOOD} />
      <Round size={[3.6, 0.8, 0.12]} radius={0.06} position={[0, 4.2, -2.9]} color="#fff8e7" />
      <Sign position={[0, 4.2, -2.83]} scale={0.4}>
        <div className="text-center leading-tight text-[#7c2d12]">
          <div className="text-[28px] font-black">Fundación de Jhon</div>
          <div className="text-[14px] font-bold uppercase tracking-[0.3em]">Próximamente</div>
        </div>
      </Sign>
      {/* Corazón */}
      <group position={[0, 5.6, -3.2]} scale={0.75}>
        {[-0.32, 0.32].map((x) => (
          <Part key={x} color="#f43f5e" position={[x, 0.25, 0]} roughness={0.35}>
            <sphereGeometry args={[0.45, 20, 16]} />
          </Part>
        ))}
        <Part color="#f43f5e" position={[0, -0.28, 0]} rotation={[0, Math.PI / 4, Math.PI]} roughness={0.35}>
          <coneGeometry args={[0.7, 1.1, 4]} />
        </Part>
      </group>
      {[-1.2, 1.2].map((x) => (
        <Part key={x} color={x > 0 ? '#3b82f6' : '#ef4444'} position={[x, 0.12, 2.5]} roughness={0.4}>
          <cylinderGeometry args={[0.28, 0.22, 0.16, 20]} />
        </Part>
      ))}
      {pets.map((pet, i) => (
        <WanderingPet key={i} pet={pet} />
      ))}
    </Place>
  );
}

function Garage() {
  return (
    <Place id="contacto" labelHeight={8}>
      {/* Entrada de concreto */}
      <Round size={[6.6, 0.08, 7.6]} radius={0.04} position={[0, 0.05, 6.2]} color="#b8b4ab" roughness={0.95} shadow={false} />
      {/* Casa con garaje: la puerta queda alineada con la calle */}
      <group position={[-1.3, 0, 0]}>
        <Round size={[8, 3.4, 6.5]} radius={0.15} position={[0, 1.7, -0.8]} color="#f1ebe0" roughness={0.85} />
        <GableRoof width={8} rise={1.8} depth={6.5} baseY={3.4} z={-0.8} wallColor="#f1ebe0" roofColor="#5b6470" />
        <Round size={[0.4, 1.9, 0.4]} radius={0.05} position={[-2.6, 4.85, -1.8]} color="#8d8478" />
        {/* Puerta enrollable a medio abrir */}
        <Round size={[4.2, 2.9, 0.12]} radius={0.06} position={[1.3, 1.45, 2.45]} color="#2b2f36" />
        <group position={[1.3, 2.25, 2.55]}>
          {[0, 1, 2, 3].map((i) => (
            <Round key={i} size={[4, 0.36, 0.06]} radius={0.03} position={[0, 0.55 - i * 0.38, 0]} color="#d9d4ca" metalness={0.4} roughness={0.5} />
          ))}
        </group>
        <Round size={[4.5, 0.25, 0.2]} radius={0.06} position={[1.3, 3.05, 2.5]} color="#facc15" />
        <Window position={[-2.6, 1.9, 2.45]} size={[1.6, 1.2]} />
        {/* Banco de herramientas y llantas */}
        <group position={[-3, 0, 3.6]}>
          <Round size={[1.8, 0.1, 0.8]} radius={0.04} position={[0, 0.9, 0]} {...WOOD} />
          {[-0.8, 0.8].map((x) => (
            <Round key={x} size={[0.08, 0.9, 0.7]} radius={0.03} position={[x, 0.45, 0]} {...STEEL} />
          ))}
          <Round size={[0.5, 0.25, 0.25]} radius={0.06} position={[-0.4, 1.08, 0]} color="#d62828" />
          <Round size={[0.3, 0.06, 0.08]} radius={0.02} position={[0.3, 0.98, 0.1]} {...STEEL} />
        </group>
        {[0, 0.28, 0.56].map((y) => (
          <Part key={y} color="#151515" position={[-4.6, 0.16 + y, 1.6]} rotation={[Math.PI / 2, 0, 0]} roughness={0.9}>
            <torusGeometry args={[0.32, 0.13, 12, 24]} />
          </Part>
        ))}
      </group>
      <Car position={[carSpot.local[0], 0, carSpot.local[1]]} rotation={[0, carSpot.rotation, 0]} />
    </Place>
  );
}

export function Places() {
  return (
    <>
      <GamerRoom />
      <Pitch />
      <Gym />
      <Shelter />
      <Garage />
    </>
  );
}
