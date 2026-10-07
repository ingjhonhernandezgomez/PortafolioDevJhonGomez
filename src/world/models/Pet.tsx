import { useRef, type MutableRefObject } from 'react';
import { useFrame, type GroupProps } from '@react-three/fiber';
import { MathUtils, type Group } from 'three';
import { Ball, Capsule, Part } from './parts';

export type PetColors = {
  body: string;
  /** Manto del lomo (el negro del pastor alemán). */
  saddle?: string;
  muzzle?: string;
  /** Color de pecho y patas. */
  belly?: string;
};

type PetProps = GroupProps & {
  kind: 'dog' | 'cat';
  colors: PetColors;
  /** Velocidad actual (0 = quieto); mueve patas, cola y lengua, y decide si se sienta. */
  speed: MutableRefObject<number>;
  /** Desfase para que los animales no se muevan todos al mismo ritmo. */
  seed?: number;
};

const FUR = { roughness: 0.9, sheen: 0.6 };

/**
 * Perro o gato de formas orgánicas, mirando hacia +Z.
 * Camina, jadea, mueve la cola y, si se queda quieto, se sienta y mira alrededor.
 */
export function Pet({ kind, colors, speed, seed = 0, ...props }: PetProps) {
  const isDog = kind === 'dog';
  const s = isDog ? 1 : 0.62;
  const belly = colors.belly ?? colors.body;
  const dark = colors.saddle ?? colors.body;
  const fur = (color: string) => ({ color, sheenColor: '#ffffff', ...FUR });

  const root = useRef<Group>(null);
  const torso = useRef<Group>(null);
  const chest = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Group>(null);
  const tongue = useRef<Group>(null);
  const ears = useRef<Group[]>([]);
  const frontLegs = useRef<Group[]>([]);
  const rearLegs = useRef<Group[]>([]);
  const state = useRef({ idle: 0, sit: 0 });

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime + seed * 3.7;
    const dt = Math.min(delta, 0.05);
    const moving = Math.min(speed.current / 3, 1);
    const st = state.current;
    st.idle = speed.current < 0.35 ? st.idle + dt : 0;
    st.sit = MathUtils.damp(st.sit, st.idle > 1.2 ? 1 : 0, 4, dt);
    const sit = st.sit;

    // Patas: paso cruzado al caminar, plegadas al sentarse.
    const stride = t * (isDog ? 12 : 10);
    frontLegs.current.forEach((leg, i) => {
      leg.rotation.x = Math.sin(stride + (i ? Math.PI : 0)) * 0.6 * moving + sit * 0.42;
    });
    rearLegs.current.forEach((leg, i) => {
      leg.rotation.x = Math.sin(stride + (i ? 0 : Math.PI)) * 0.6 * moving - sit * 1.25;
    });
    if (torso.current) {
      torso.current.rotation.x = -0.42 * sit;
      torso.current.position.y = Math.abs(Math.sin(stride)) * 0.04 * moving;
    }
    if (root.current) root.current.position.y = -0.1 * sit;
    // Respiración (más agitada después de correr).
    if (chest.current) chest.current.scale.setScalar(1 + Math.sin(t * (isDog ? 7 : 3)) * (isDog ? 0.025 : 0.015));
    if (head.current) {
      head.current.rotation.x = Math.sin(stride) * 0.06 * moving + sit * 0.3;
      head.current.rotation.y = Math.sin(t * 0.6) * 0.5 * sit;
      head.current.rotation.z = Math.sin(t * 0.9) * 0.12 * sit;
    }
    if (tail.current) {
      const wag = isDog ? 9 + moving * 5 : 2.5;
      tail.current.rotation.y = Math.sin(t * wag) * (isDog ? 0.55 : 0.35);
      tail.current.rotation.x = isDog ? 0.25 * sit : 0;
    }
    // Orejas que se mueven de vez en cuando.
    ears.current.forEach((ear, i) => {
      const twitch = Math.max(0, Math.sin(t * 0.8 + i * 2) - 0.92) * 6;
      ear.rotation.z = (i ? 1 : -1) * (0.18 + twitch * 0.4);
    });
    if (tongue.current) tongue.current.visible = isDog && (moving > 0.3 || sit > 0.5);
  });

  const legs = (front: boolean) =>
    [0.12, -0.12].map((x, i) => (
      <group
        key={x}
        position={[x, 0.5, front ? 0.28 : -0.3]}
        ref={(el) => {
          if (!el) return;
          (front ? frontLegs : rearLegs).current[i] = el;
        }}
      >
        <Capsule radius={front ? 0.065 : 0.08} length={0.2} position={[0, -0.12, front ? 0 : -0.02]} {...fur(front ? belly : colors.body)} />
        <Capsule radius={0.05} length={0.17} position={[0, -0.33, front ? 0.01 : -0.04]} {...fur(belly)} />
        <Ball radius={0.06} position={[0, -0.46, 0.04]} scale={[1, 0.62, 1.35]} {...fur(belly)} />
      </group>
    ));

  return (
    <group {...props}>
      <group ref={root} scale={s}>
        {legs(false)}
        {/* El cuerpo gira desde la cadera para sentarse */}
        <group position={[0, 0.55, -0.3]}>
          <group ref={torso}>
            <group position={[0, -0.55, 0.3]}>
              <group ref={chest} position={[0, 0.62, 0]}>
                <Ball radius={0.25} scale={isDog ? [0.88, 0.88, 1.55] : [0.75, 0.78, 1.6]} {...fur(colors.body)} />
                <Ball radius={0.21} position={[0, -0.02, 0.27]} scale={[0.92, 1.02, 0.9]} {...fur(belly)} />
                <Ball radius={0.21} position={[0, 0.02, -0.27]} {...fur(colors.body)} />
                {colors.saddle && <Ball radius={0.26} position={[0, 0.08, -0.06]} scale={[0.9, 0.62, 1.4]} {...fur(colors.saddle)} />}
              </group>
              {legs(true)}
              <Capsule radius={isDog ? 0.1 : 0.08} length={0.16} position={[0, 0.84, 0.36]} rotation={[0.75, 0, 0]} {...fur(colors.body)} />
              {/* Cabeza */}
              <group ref={head} position={[0, 0.98, 0.48]}>
                <Ball radius={isDog ? 0.15 : 0.17} scale={[1, 0.95, 1.08]} {...fur(colors.body)} />
                {[0.075, -0.075].map((x) => (
                  <Ball key={x} radius={0.09} position={[x, -0.04, 0.06]} {...fur(colors.muzzle ?? belly)} />
                ))}
                <Capsule
                  radius={isDog ? 0.065 : 0.05}
                  length={isDog ? 0.13 : 0.02}
                  position={[0, -0.045, isDog ? 0.16 : 0.13]}
                  rotation={[Math.PI / 2, 0, 0]}
                  {...fur(colors.muzzle ?? colors.body)}
                />
                <Ball radius={isDog ? 0.035 : 0.025} position={[0, -0.01, isDog ? 0.29 : 0.19]} color="#111" roughness={0.25} />
                {[0.07, -0.07].map((x) => (
                  <group key={x} position={[x, 0.04, isDog ? 0.12 : 0.14]}>
                    <Ball radius={isDog ? 0.026 : 0.034} color={isDog ? '#2a1a10' : '#9acd32'} roughness={0.15} />
                    <Ball radius={0.008} position={[0.008, 0.01, 0.022]} color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} shadow={false} />
                  </group>
                ))}
                {[0.08, -0.08].map((x, i) => (
                  <group
                    key={x}
                    position={[x, 0.13, -0.02]}
                    ref={(el) => {
                      if (el) ears.current[i] = el;
                    }}
                  >
                    <Part position={[0, 0.08, 0]} scale={[1, 1, 0.45]} {...fur(dark)}>
                      <coneGeometry args={[isDog ? 0.07 : 0.065, isDog ? 0.2 : 0.13, 16]} />
                    </Part>
                    <Part position={[0, 0.07, 0.015]} scale={[0.6, 0.75, 0.3]} color="#e9a3a3" roughness={0.8} shadow={false}>
                      <coneGeometry args={[isDog ? 0.07 : 0.065, isDog ? 0.2 : 0.13, 16]} />
                    </Part>
                  </group>
                ))}
                <group ref={tongue} position={[0, -0.1, 0.24]} visible={false}>
                  <Ball radius={0.04} rotation={[0.5, 0, 0]} scale={[1, 0.3, 1.5]} color="#e86a7a" roughness={0.4} />
                </group>
              </group>
              {/* Cola: tres segmentos para que se vea curva y peluda */}
              <group ref={tail} position={[0, 0.72, -0.4]}>
                {[0, 1, 2].map((i) => (
                  <Capsule
                    key={i}
                    radius={(isDog ? 0.065 : 0.035) - i * (isDog ? 0.008 : 0.004)}
                    length={isDog ? 0.13 : 0.16}
                    position={isDog ? [0, -0.06 - i * 0.1, -0.12 - i * 0.06] : [0, 0.08 + i * 0.15, -0.12 - (i === 2 ? 0.04 : 0)]}
                    rotation={isDog ? [-2.2 + i * 0.25, 0, 0] : [-0.5 + i * 0.35, 0, 0]}
                    {...fur(i === 2 ? dark : colors.body)}
                  />
                ))}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
