import { forwardRef } from 'react';
import type { Group } from 'three';
import { Ball, Capsule, Part, Round } from './parts';

const PAINT = { color: '#111115', metalness: 0.55, roughness: 0.25, clearcoat: 1 };
const METAL = { color: '#a3a9b1', metalness: 0.9, roughness: 0.28 };
const DARK_METAL = { color: '#2b2d31', metalness: 0.7, roughness: 0.42 };
const RED = '#d62828';
const JERSEY = { color: '#f8f8f5', roughness: 0.8, sheen: 0.5, sheenColor: '#ffffff' };
const JEANS = { color: '#2f4a73', roughness: 0.9, sheen: 0.4, sheenColor: '#6b8fc2' };
const SKIN = { color: '#c58c63', roughness: 0.6 };

function Wheel({ z, name }: { z: number; name: string }) {
  return (
    <group position={[0, 0.37, z]} name={name}>
      <group rotation={[0, Math.PI / 2, 0]}>
        <Part color="#141414" roughness={0.88}>
          <torusGeometry args={[0.285, 0.088, 20, 48]} />
        </Part>
      </group>
      {/* Rin de aleación con tres radios dobles */}
      <Part {...DARK_METAL} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.215, 0.215, 0.04, 40]} />
      </Part>
      {[0, 1, 2].map((i) => (
        <Round key={i} size={[0.05, 0.4, 0.035]} radius={0.017} rotation={[(i * Math.PI) / 3, 0, 0]} color={RED} metalness={0.5} roughness={0.32} shadow={false} />
      ))}
      <Part {...METAL} rotation={[0, 0, Math.PI / 2]} position={[0.05, 0, 0]} shadow={false}>
        <cylinderGeometry args={[0.15, 0.15, 0.012, 36]} />
      </Part>
      <Part {...METAL} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 20]} />
      </Part>
    </group>
  );
}

/** Jhon: camiseta blanca con vivos dorados, jean y casco negro. */
function Rider() {
  return (
    <group position={[0, 0, -0.22]} name="rider">
      {/* Piernas: la izquierda baja al piso cuando la moto se detiene */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.16, 0.98, 0.1]} name={side > 0 ? 'rider-leg-left' : 'rider-leg-right'}>
          <Capsule radius={0.085} length={0.34} position={[0, 0, 0.13]} rotation={[-1.25, 0, 0]} {...JEANS} />
          <group position={[0, 0, 0.3]} name={side > 0 ? 'rider-shin-left' : undefined}>
            <Capsule radius={0.072} length={0.34} position={[side * 0.03, -0.3, 0.06]} rotation={[0.3, 0, 0]} {...JEANS} />
            <Round size={[0.12, 0.1, 0.25]} radius={0.045} position={[side * 0.05, -0.51, 0.1]} color="#f1f1f1" roughness={0.6} />
          </group>
        </group>
      ))}
      {/* Torso, que se inclina un poco al acelerar */}
      <group position={[0, 1.1, 0]} name="rider-body">
        <Capsule radius={0.17} length={0.32} position={[0, 0.3, 0.08]} rotation={[0.42, 0, 0]} scale={[1.25, 1, 0.85]} {...JERSEY} />
        <Capsule radius={0.172} length={0.02} position={[0, 0.08, -0.02]} rotation={[0.42, 0, 0]} scale={[1.26, 0.25, 0.86]} color="#d4af37" metalness={0.5} roughness={0.35} shadow={false} />
        {/* Brazos hacia el manubrio */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Ball radius={0.08} position={[side * 0.24, 0.48, 0.16]} {...JERSEY} />
            <Capsule radius={0.062} length={0.24} position={[side * 0.28, 0.37, 0.28]} rotation={[-1.0, 0, side * 0.22]} {...JERSEY} />
            <Capsule radius={0.052} length={0.24} position={[side * 0.33, 0.21, 0.52]} rotation={[-0.55, 0, side * 0.1]} {...SKIN} />
            <Ball radius={0.062} position={[side * 0.34, 0.11, 0.66]} color="#151515" roughness={0.7} />
          </group>
        ))}
        {/* Cabeza con casco negro brillante y visor */}
        <group position={[0, 0.74, 0.22]} name="rider-head">
          <Capsule radius={0.06} length={0.05} position={[0, -0.14, -0.03]} rotation={[0.4, 0, 0]} {...SKIN} />
          <Ball radius={0.2} color="#0f0f12" metalness={0.4} roughness={0.18} clearcoat={1} />
          <Part color="#24496e" position={[0, -0.01, 0.11]} scale={[1, 0.62, 0.8]} metalness={0.9} roughness={0.05} clearcoat={1} shadow={false}>
            <sphereGeometry args={[0.165, 32, 16, 0, Math.PI * 2, 0.6, 1.2]} />
          </Part>
          <Capsule radius={0.018} length={0.22} position={[0, 0.19, -0.02]} rotation={[Math.PI / 2, 0, 0]} color={RED} shadow={false} />
        </group>
      </group>
    </group>
  );
}

/**
 * Pulsar NS 160 negra con Jhon encima, mirando hacia +Z.
 * Las ruedas se llaman "front-wheel" y "rear-wheel" para animarlas.
 */
export const Moto = forwardRef<Group>(function Moto(_, ref) {
  return (
    <group ref={ref}>
      <Wheel z={0.7} name="front-wheel" />
      <Wheel z={-0.68} name="rear-wheel" />

      {/* Basculante, chasis y motor */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Capsule radius={0.045} length={0.56} position={[side * 0.13, 0.42, -0.38]} rotation={[Math.PI / 2 - 0.12, 0, 0]} {...DARK_METAL} />
          <Capsule radius={0.04} length={0.7} position={[side * 0.14, 0.8, 0.1]} rotation={[Math.PI / 2 + 0.35, 0, 0]} {...DARK_METAL} />
        </group>
      ))}
      <Round size={[0.32, 0.4, 0.5]} radius={0.1} position={[0, 0.55, 0.06]} {...METAL} />
      {/* Radiador entre el motor y la rueda delantera */}
      <Round size={[0.34, 0.32, 0.06]} radius={0.03} position={[0, 0.68, 0.42]} rotation={[-0.3, 0, 0]} {...DARK_METAL} />
      {[0, 1, 2, 3].map((i) => (
        <Round key={i} size={[0.34, 0.02, 0.3]} radius={0.009} position={[0, 0.6 + i * 0.05, 0.12]} rotation={[0.35, 0, 0]} {...DARK_METAL} shadow={false} />
      ))}
      <Round size={[0.26, 0.17, 0.44]} radius={0.08} position={[0, 0.3, -0.18]} {...DARK_METAL} />
      <Part {...METAL} position={[0, 0.3, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.06, 24]} />
      </Part>

      {/* Tanque esculpido, carenados con vivos rojos */}
      <Ball radius={1} position={[0, 0.98, 0.22]} scale={[0.27, 0.19, 0.38]} {...PAINT} />
      <Ball radius={1} position={[0, 0.9, 0.42]} scale={[0.24, 0.16, 0.22]} {...PAINT} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Round size={[0.07, 0.34, 0.6]} radius={0.032} position={[side * 0.24, 0.84, 0.46]} rotation={[0.3, side * 0.15, 0]} {...PAINT} />
          <Round size={[0.075, 0.04, 0.55]} radius={0.018} position={[side * 0.26, 0.76, 0.46]} rotation={[0.3, side * 0.15, 0]} color={RED} shadow={false} />
        </group>
      ))}
      {/* Sillín partido y cola afilada */}
      <Round size={[0.3, 0.11, 0.42]} radius={0.05} position={[0, 0.95, -0.24]} rotation={[-0.08, 0, 0]} color="#1c1c1c" roughness={0.92} sheen={0.3} />
      <Round size={[0.24, 0.1, 0.26]} radius={0.045} position={[0, 1.04, -0.55]} rotation={[-0.15, 0, 0]} color="#1c1c1c" roughness={0.92} sheen={0.3} />
      <Ball radius={1} position={[0, 0.93, -0.6]} rotation={[-0.3, 0, 0]} scale={[0.14, 0.09, 0.32]} {...PAINT} />
      <Round size={[0.16, 0.05, 0.04]} radius={0.018} position={[0, 1.06, -0.86]} color="#ff2a3a" emissive="#ff1a2a" emissiveIntensity={2.5} shadow={false} />
      <Round size={[0.22, 0.04, 0.3]} radius={0.016} position={[0, 0.72, -0.86]} rotation={[0.6, 0, 0]} {...DARK_METAL} />

      {/* Horquilla dorada, guardabarros, farola y manubrio */}
      {[-1, 1].map((side) => (
        <Capsule key={side} radius={0.042} length={0.62} position={[side * 0.11, 0.72, 0.6]} rotation={[-0.42, 0, 0]} color="#d4a72c" metalness={0.85} roughness={0.22} />
      ))}
      <Ball radius={1} position={[0, 0.72, 0.72]} rotation={[0.25, 0, 0]} scale={[0.09, 0.03, 0.2]} {...PAINT} />
      {/* Pipa de dirección, tijera superior y carenado que une el tanque con la farola */}
      <Capsule radius={0.055} length={0.25} position={[0, 0.98, 0.5]} rotation={[-0.42, 0, 0]} {...DARK_METAL} />
      <Round size={[0.3, 0.05, 0.12]} radius={0.02} position={[0, 1.07, 0.47]} {...DARK_METAL} />
      <Ball radius={1} position={[0, 0.98, 0.58]} scale={[0.2, 0.15, 0.2]} {...PAINT} />
      <Ball radius={1} position={[0, 1.07, 0.7]} rotation={[-0.35, 0, 0]} scale={[0.17, 0.15, 0.14]} {...PAINT} />
      <Round size={[0.2, 0.09, 0.05]} radius={0.035} position={[0, 1.06, 0.82]} rotation={[-0.35, 0, 0]} color="#ffffff" emissive="#fff3cf" emissiveIntensity={3} shadow={false} />
      <Round size={[0.26, 0.03, 0.04]} radius={0.013} position={[0, 0.98, 0.81]} rotation={[-0.35, 0, 0]} color="#bfe9ff" emissive="#bfe9ff" emissiveIntensity={2} shadow={false} />
      <Capsule radius={0.022} length={0.62} position={[0, 1.17, 0.52]} rotation={[0, 0, Math.PI / 2]} color="#1a1a1a" metalness={0.5} roughness={0.4} />
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.26, 1.19, 0.52]}>
          <Capsule radius={0.036} length={0.08} rotation={[0, 0, Math.PI / 2]} color="#111" roughness={0.9} />
          <Capsule radius={0.01} length={0.18} position={[0, 0.1, 0]} color="#1a1a1a" />
          <Ball radius={0.06} position={[side * 0.03, 0.2, 0]} scale={[1, 0.6, 0.3]} color="#1a1a1a" metalness={0.6} roughness={0.3} />
        </group>
      ))}

      <Rider />
    </group>
  );
});
