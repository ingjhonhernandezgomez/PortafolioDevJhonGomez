import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Sky } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO, SMAA, Vignette } from '@react-three/postprocessing';
import type { DirectionalLight } from 'three';
import { setAmbience } from './ambience';
import { suspendAudio, unlockAudio } from './audio';
import { Island } from './Island';
import { Places } from './Places';
import { Player } from './Player';
import { Life } from './Life';
import { Tyson } from './Tyson';
import { useKeyboardControls } from './input';
import { player, useWorld, worldStore } from './store';
import { Hud } from './ui/Hud';
import { Intro } from './ui/Intro';
import { ZonePanel } from './ui/ZonePanel';

type WorldProps = {
  onQuickMode: () => void;
};

const SUN = [60, 70, 35] as const;
const HORIZON = '#cfe7f5';

/** Sol con sombras que siguen a la moto para mantenerlas nítidas en un mundo grande. */
function Sun() {
  const light = useRef<DirectionalLight>(null);
  useFrame(() => {
    const sun = light.current;
    if (!sun) return;
    sun.position.set(player.position.x + SUN[0] * 0.5, SUN[1] * 0.5, player.position.z + SUN[2] * 0.5);
    sun.target.position.copy(player.position);
    sun.target.updateMatrixWorld();
  });

  return (
    <>
      <hemisphereLight args={['#fff4e0', '#5b8f4a', 0.35]} />
      <directionalLight
        ref={light}
        intensity={2.2}
        color="#fff0d9"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-camera-near={1}
        shadow-camera-far={150}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  );
}

/**
 * Reflejos para pintura, cromo y vidrio, generados en el navegador
 * (sin descargar mapas HDR externos).
 */
function Reflections() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.4}>
      <color attach="background" args={['#b9dcf2']} />
      <Lightformer form="rect" intensity={3} color="#fff6e5" position={[0, 12, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#dbeeff" position={[0, 4, -15]} scale={[30, 6, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#dbeeff" position={[0, 4, 15]} rotation-y={Math.PI} scale={[30, 6, 1]} />
      <Lightformer form="rect" intensity={0.6} color="#6fae58" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[40, 40, 1]} />
      <Lightformer form="circle" intensity={6} color="#fff1d0" position={[12, 10, 8]} scale={4} />
    </Environment>
  );
}

/** Avisa cuando la escena ya pintó sus primeros cuadros (los shaders tardan en compilar). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 3) worldStore.set({ ready: true });
  });
  return null;
}

/** Oclusión ambiental (sombras de contacto), brillo en luces y viñeta. */
function Effects({ lowPower }: { lowPower: boolean }) {
  // En celulares se omite la oclusión ambiental para cuidar el rendimiento.
  return lowPower ? (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
      <SMAA />
      <Vignette offset={0.25} darkness={0.55} />
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      <N8AO aoRadius={1.6} intensity={2.2} distanceFalloff={1} halfRes />
      <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.95} luminanceSmoothing={0.2} />
      <SMAA />
      <Vignette offset={0.25} darkness={0.55} />
    </EffectComposer>
  );
}

/** "El mundo de Jhon": un barrio 3D que se recorre en moto con Tyson. */
export default function World({ onQuickMode }: WorldProps) {
  const started = useWorld((s) => s.started);
  const panelOpen = useWorld((s) => s.openZone !== null);
  const nearZone = useWorld((s) => s.nearZone);
  const [lowPower] = useState(() => window.matchMedia('(pointer: coarse)').matches);
  useKeyboardControls(started && !panelOpen);

  // Música ambiental del lugar donde está la moto.
  useEffect(() => {
    setAmbience(started ? nearZone : null);
  }, [started, nearZone]);

  // El audio se reanuda con cualquier interacción y se apaga al salir del mundo 3D.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      setAmbience(null);
      suspendAudio();
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: HORIZON }}>
      <Canvas shadows="soft" dpr={[1, lowPower ? 1.5 : 2]} camera={{ fov: 42, near: 0.5, far: 600, position: [0, 55, 95] }}>
        <color attach="background" args={[HORIZON]} />
        <fog attach="fog" args={[HORIZON, 110, 330]} />
        <Sky sunPosition={[...SUN]} turbidity={6} rayleigh={1.4} mieCoefficient={0.004} mieDirectionalG={0.85} distance={4500} />
        <Sun />
        <Reflections />
        {/* Todo espera a que carguen los modelos y texturas antes de mostrarse */}
        <Suspense fallback={null}>
          <Island />
          <Places />
          <Player />
          <Tyson />
          <Life />
          <ReadySignal />
          <Effects lowPower={lowPower} />
        </Suspense>
      </Canvas>
      {started && <Hud onQuickMode={onQuickMode} />}
      <ZonePanel />
      <Intro onQuickMode={onQuickMode} />
    </div>
  );
}
