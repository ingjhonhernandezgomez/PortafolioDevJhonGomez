import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, type Group, type InstancedMesh, type Mesh, type MeshStandardMaterial } from 'three';
import { flowers, zoneToWorld } from './obstacles';
import { player } from './store';

/** Detalles en movimiento que hacen que el mundo se sienta vivo. */

function Bird({ radius, height, speed, offset }: { radius: number; height: number; speed: number; offset: number }) {
  const group = useRef<Group>(null);
  const wings = useRef<Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    if (group.current) {
      group.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 2.3) * 1.2, Math.sin(t) * radius);
      // Tangente del círculo para mirar hacia donde vuela.
      group.current.rotation.y = Math.atan2(-Math.sin(t) * Math.sign(speed), Math.cos(t) * Math.sign(speed));
    }
    const flap = Math.sin(clock.elapsedTime * 9 + offset * 5) * 0.7;
    wings.current.forEach((wing, i) => {
      wing.rotation.z = (i ? -1 : 1) * flap;
    });
  });

  return (
    <group ref={group}>
      <mesh>
        <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
        <meshStandardMaterial color="#2d3436" />
      </mesh>
      {[1, -1].map((side, i) => (
        <group
          key={side}
          ref={(el) => {
            if (el) wings.current[i] = el;
          }}
        >
          <mesh position={[side * 0.32, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.6, 0.22, 0.02]} />
            <meshStandardMaterial color="#3d4548" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Birds() {
  const birds = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const flock = i % 3;
        return {
          radius: 26 + flock * 18 + (i % 4) * 1.4,
          height: 16 + flock * 5 + (i % 3) * 0.8,
          speed: (flock === 1 ? -1 : 1) * (0.12 + flock * 0.02),
          offset: flock * 2.1 + (i % 5) * 0.12,
        };
      }),
    [],
  );
  return (
    <>
      {birds.map((bird, i) => (
        <Bird key={i} {...bird} />
      ))}
    </>
  );
}

const butterflyColors = ['#f97316', '#facc15', '#60a5fa', '#f472b6', '#a78bfa'];

function Butterfly({ x, z, color, seed }: { x: number; z: number; color: string; seed: number }) {
  const group = useRef<Group>(null);
  const wings = useRef<Group[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.6 + seed;
    if (group.current) {
      group.current.position.set(x + Math.sin(t * 1.3) * 1.6, 0.7 + Math.sin(t * 3.1) * 0.35 + Math.sin(t * 0.7) * 0.3, z + Math.cos(t) * 1.6);
      group.current.rotation.y = t * 1.3;
    }
    const flap = Math.sin(clock.elapsedTime * 22 + seed * 7) * 0.9;
    wings.current.forEach((wing, i) => {
      wing.rotation.z = (i ? -1 : 1) * (0.3 + flap);
    });
  });
  return (
    <group ref={group} scale={0.6}>
      {[1, -1].map((side, i) => (
        <group
          key={side}
          ref={(el) => {
            if (el) wings.current[i] = el;
          }}
        >
          <mesh position={[side * 0.13, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.14, 12]} />
            <meshStandardMaterial color={color} side={2} emissive={color} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.02, 0.14, 4, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function Butterflies() {
  const spots = useMemo(() => {
    const picked = flowers.filter((_, i) => i % 35 === 0).slice(0, 10);
    const [sx, sz] = zoneToWorld('fundacion', 0, 2);
    return [...picked.map((flower) => ({ x: flower.x, z: flower.z })), { x: sx, z: sz }, { x: 6, z: 6 }, { x: -6, z: -5 }];
  }, []);
  return (
    <>
      {spots.map((spot, i) => (
        <Butterfly key={i} x={spot.x} z={spot.z} color={butterflyColors[i % butterflyColors.length]} seed={i * 1.9} />
      ))}
    </>
  );
}

const DROPS = 70;
const dummy = new Object3D();

/** Gotas que saltan de la fuente y caen al estanque. */
function FountainDrops() {
  const mesh = useRef<InstancedMesh>(null);
  const drops = useMemo(
    () =>
      Array.from({ length: DROPS }, (_, i) => ({
        angle: (i / DROPS) * Math.PI * 2 + (i % 3) * 0.2,
        reach: 1.2 + (i % 5) * 0.35,
        phase: (i * 0.37) % 1,
        height: 1.1 + (i % 4) * 0.25,
      })),
    [],
  );
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    drops.forEach((drop, i) => {
      const p = (clock.elapsedTime * 0.55 + drop.phase) % 1;
      const r = drop.reach * p;
      dummy.position.set(Math.cos(drop.angle) * r, 3.2 + drop.height * 4 * p * (1 - p) - p * 2.5, Math.sin(drop.angle) * r);
      dummy.scale.setScalar(1 - p * 0.4);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, DROPS]}>
      <sphereGeometry args={[0.06, 8, 6]} />
      <meshStandardMaterial color="#d9f3ff" emissive="#9be3ff" emissiveIntensity={0.5} transparent opacity={0.85} />
    </instancedMesh>
  );
}

type Puff = { mesh: Mesh | null; life: number; vx: number; vy: number; vz: number };

/** Bocanadas que suben y se desvanecen (humo de chimenea y polvo de la moto). */
function usePuffs(count: number) {
  const puffs = useRef<Puff[]>(Array.from({ length: count }, () => ({ mesh: null, life: 0, vx: 0, vy: 0, vz: 0 })));
  const step = (dt: number, grow: number) => {
    for (const puff of puffs.current) {
      if (!puff.mesh) continue;
      if (puff.life <= 0) {
        puff.mesh.visible = false;
        continue;
      }
      puff.life -= dt;
      puff.mesh.visible = true;
      puff.mesh.position.x += puff.vx * dt;
      puff.mesh.position.y += puff.vy * dt;
      puff.mesh.position.z += puff.vz * dt;
      puff.mesh.scale.multiplyScalar(1 + grow * dt);
      (puff.mesh.material as MeshStandardMaterial).opacity = Math.max(puff.life, 0) * 0.5;
    }
  };
  const spawn = (x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, size: number) => {
    const puff = puffs.current.find((p) => p.life <= 0 && p.mesh);
    if (!puff || !puff.mesh) return;
    puff.life = life;
    puff.vx = vx;
    puff.vy = vy;
    puff.vz = vz;
    puff.mesh.position.set(x, y, z);
    puff.mesh.scale.setScalar(size);
  };
  return { puffs, step, spawn };
}

function PuffMeshes({ puffs, color }: { puffs: ReturnType<typeof usePuffs>['puffs']; color: string }) {
  return (
    <>
      {puffs.current.map((puff, i) => (
        <mesh
          key={i}
          visible={false}
          ref={(el) => {
            puff.mesh = el;
          }}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0} depthWrite={false} roughness={1} />
        </mesh>
      ))}
    </>
  );
}

function ChimneySmoke() {
  const { puffs, step, spawn } = usePuffs(10);
  const timer = useRef(0);
  const [x, z] = useMemo(() => zoneToWorld('contacto', -3.9, -1.8), []);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    timer.current -= dt;
    if (timer.current <= 0) {
      timer.current = 0.7;
      spawn(x, 6, z, 0.25, 0.7, 0.1, 1.6, 0.25);
    }
    step(dt, 0.5);
  });
  return <PuffMeshes puffs={puffs} color="#e5e7eb" />;
}

function MotoDust() {
  const { puffs, step, spawn } = usePuffs(18);
  const timer = useRef(0);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    timer.current -= dt;
    const speed = Math.abs(player.speed);
    if (speed > 3 && timer.current <= 0) {
      timer.current = 0.08;
      const back = -Math.sign(player.speed);
      const sx = player.position.x + Math.sin(player.heading) * back * 0.9;
      const sz = player.position.z + Math.cos(player.heading) * back * 0.9;
      spawn(sx + (Math.random() - 0.5) * 0.2, 0.15, sz, (Math.random() - 0.5) * 0.4, 0.35, (Math.random() - 0.5) * 0.4, 0.8, 0.12 + speed * 0.008);
    }
    step(dt, 1.2);
  });
  return <PuffMeshes puffs={puffs} color="#d6cfc2" />;
}

export function Life() {
  return (
    <group>
      <Birds />
      <Butterflies />
      <FountainDrops />
      <ChimneySmoke />
      <MotoDust />
    </group>
  );
}
