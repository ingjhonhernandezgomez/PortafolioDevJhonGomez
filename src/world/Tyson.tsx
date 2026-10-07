import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { MathUtils, Vector3, type Group } from 'three';
import { TysonModel } from './models/TysonModel';
import { player, useWorld } from './store';
import { zoneById } from './zones';

const target = new Vector3();
const offset = new Vector3();

/** Tyson, el pastor alemán de Jhon: sigue la moto y sirve de guía. */
export function Tyson() {
  const group = useRef<Group>(null);
  const speed = useRef(0);
  const started = useWorld((s) => s.started);
  const hasMoved = useWorld((s) => s.hasMoved);
  const nearZone = useWorld((s) => s.nearZone);
  const openZone = useWorld((s) => s.openZone);

  useFrame((_, delta) => {
    const dog = group.current;
    if (!dog) return;
    const dt = Math.min(delta, 0.05);

    // Se ubica detrás y a la derecha de la moto.
    const sin = Math.sin(player.heading);
    const cos = Math.cos(player.heading);
    offset.set(-sin * 2.4 + cos * 1.3, 0, -cos * 2.4 - sin * 1.3);
    target.copy(player.position).add(offset);

    const distance = dog.position.distanceTo(target);
    const run = distance > 0.25 ? Math.min(distance * 2.2, 16) : 0;
    speed.current = MathUtils.lerp(speed.current, run, 0.15);

    if (distance > 0.05) {
      const step = Math.min(speed.current * dt, distance);
      const dx = target.x - dog.position.x;
      const dz = target.z - dog.position.z;
      dog.position.x += (dx / distance) * step;
      dog.position.z += (dz / distance) * step;
      if (speed.current > 0.4) {
        const desired = Math.atan2(dx, dz);
        const diff = Math.atan2(Math.sin(desired - dog.rotation.y), Math.cos(desired - dog.rotation.y));
        dog.rotation.y += diff * Math.min(dt * 8, 1);
      }
    }
    // Saltito al correr.
    dog.position.y = Math.abs(Math.sin(performance.now() / 90)) * 0.08 * Math.min(speed.current / 6, 1);
  });

  let bubble: string | null = null;
  if (started && !hasMoved) bubble = '¡Guau! Soy Tyson. Usa las flechas y te acompaño 🐾';
  else if (nearZone && !openZone) bubble = `¡Guau! ¡Entremos! ${zoneById[nearZone].emoji}`;

  return (
    <group ref={group} position={[1.3, 0, 20.4]} rotation={[0, Math.PI, 0]}>
      <TysonModel speed={speed} />
      {bubble && (
        <Html position={[0, 2.1, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="w-max max-w-[220px] rounded-2xl bg-white px-3 py-1.5 text-center text-xs font-semibold text-gray-900 shadow-lg sm:text-sm">
            {bubble}
          </div>
        </Html>
      )}
    </group>
  );
}
