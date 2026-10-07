import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame, type GroupProps } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { Box3, LoopRepeat, Vector3, type AnimationAction, type Group, type Mesh } from 'three';

/**
 * Pastor alemán "German Shepard" de Quaternius (CC-BY 3.0, vía poly.pizza),
 * con sus animaciones de reposo, caminar y correr.
 */
export const TYSON_URL = `${import.meta.env.BASE_URL}models/german-shepherd.glb`;

/** Largo deseado del perro en unidades del mundo (la moto mide ~2). */
const TARGET_LENGTH = 1.6;

type TysonModelProps = GroupProps & {
  speed: MutableRefObject<number>;
};

export function TysonModel({ speed, ...props }: TysonModelProps) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(TYSON_URL);
  const { actions } = useAnimations(animations, group);
  const current = useRef<string>('');
  const idleTimer = useRef(0);

  // Escala y centra el modelo para que quede apoyado en el piso.
  const fit = useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;
      }
    });
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const scale = TARGET_LENGTH / Math.max(size.x, size.z);
    return { scale, offsetY: -box.min.y * scale };
  }, [scene]);

  const play = (name: string, fade = 0.3) => {
    if (current.current === name) return;
    const next = actions[name] as AnimationAction | null | undefined;
    if (!next) return;
    const previous = actions[current.current];
    next.reset().setLoop(LoopRepeat, Infinity).fadeIn(fade).play();
    previous?.fadeOut(fade);
    current.current = name;
  };

  useEffect(() => {
    play('Idle', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  useFrame((_, delta) => {
    const s = speed.current;
    if (s > 5) play('Run');
    else if (s > 0.4) play('Walk');
    else {
      // Quieto: alterna entre reposo y olfatear el piso para que se vea vivo.
      idleTimer.current += delta;
      const cycle = idleTimer.current % 12;
      play(cycle > 8 ? 'Idle_2_HeadLow' : cycle > 5 ? 'Idle_2' : 'Idle', 0.5);
    }
    if (s <= 0.4) return;
    idleTimer.current = 0;
    const action = actions[current.current];
    if (action) action.timeScale = current.current === 'Run' ? Math.min(s / 8, 1.6) : Math.min(s / 2.5, 1.8);
  });

  return (
    <group ref={group} {...props}>
      <primitive object={scene} scale={fit.scale} position={[0, fit.offsetY, 0]} />
    </group>
  );
}

useGLTF.preload(TYSON_URL);
