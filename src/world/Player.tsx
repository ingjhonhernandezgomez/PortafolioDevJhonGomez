import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, type Group, type PerspectiveCamera } from 'three';
import { Moto } from './models/Moto';
import { stopEngine, updateEngine } from './audio';
import { input } from './input';
import { obstacles } from './obstacles';
import { openZone, player, worldStore } from './store';
import { WORLD_RADIUS, zones } from './zones';

const MAX_SPEED = 13;
const BOOST_SPEED = 19;
const REVERSE_SPEED = -5;
const ACCELERATION = 11;
const FRICTION = 6;
const STEERING = 2.4;
const MOTO_RADIUS = 0.8;

const cameraOffset = new Vector3(0, 7.5, 12.5);
const desiredCamera = new Vector3();
const lookAt = new Vector3();
const currentLook = new Vector3();

/** La Pulsar de Jhon: manejo arcade, colisiones simples, cámara y detección de zonas. */
export function Player() {
  const root = useRef<Group>(null);
  const moto = useRef<Group>(null);
  const introAngle = useRef(0);
  const cameraYaw = useRef(player.heading);
  const stopped = useRef(1);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const { started, openZone: panelZone, nearZone, hasMoved } = worldStore.get();
    const canDrive = started && !panelZone;

    // Aceleración y frenado
    const top = input.boost ? BOOST_SPEED : MAX_SPEED;
    // Acelera fuerte al arrancar y más suave arriba, para que se noten las marchas.
    if (canDrive && input.forward) player.speed += ACCELERATION * (1 - 0.65 * Math.max(player.speed, 0) / top) * dt;
    else if (canDrive && input.back) player.speed -= ACCELERATION * 1.4 * dt;
    else player.speed = MathUtils.damp(player.speed, 0, FRICTION / 4, dt);
    player.speed = MathUtils.clamp(player.speed, REVERSE_SPEED, top);
    if (!input.boost && player.speed > MAX_SPEED) player.speed = MathUtils.damp(player.speed, MAX_SPEED, 3, dt);

    // Dirección: solo gira si va en movimiento, como una moto de verdad.
    const steer = canDrive ? Number(input.left) - Number(input.right) : 0;
    const grip = MathUtils.clamp(Math.abs(player.speed) / 4, 0, 1) * Math.sign(player.speed);
    player.heading += steer * STEERING * grip * dt;

    player.position.x += Math.sin(player.heading) * player.speed * dt;
    player.position.z += Math.cos(player.heading) * player.speed * dt;

    // Choques con edificios y árboles
    for (const obstacle of obstacles) {
      const dx = player.position.x - obstacle.x;
      const dz = player.position.z - obstacle.z;
      const min = obstacle.r + MOTO_RADIUS;
      const distSq = dx * dx + dz * dz;
      if (distSq < min * min) {
        const dist = Math.sqrt(distSq) || 0.001;
        player.position.x = obstacle.x + (dx / dist) * min;
        player.position.z = obstacle.z + (dz / dist) * min;
        player.speed *= 0.6;
      }
    }

    // Borde de la isla
    const fromCenter = Math.hypot(player.position.x, player.position.z);
    if (fromCenter > WORLD_RADIUS) {
      player.position.multiplyScalar(WORLD_RADIUS / fromCenter);
      player.speed *= 0.4;
    }

    if (!hasMoved && Math.abs(player.speed) > 1) worldStore.set({ hasMoved: true });

    // Motor: suena más fuerte y agudo con la velocidad; se apaga con una tarjeta abierta.
    if (canDrive) updateEngine(player.speed);
    else stopEngine();

    // Zona más cercana
    let closest: (typeof zones)[number] | null = null;
    let closestDistance = Infinity;
    for (const zone of zones) {
      const d = Math.hypot(player.position.x - zone.position[0], player.position.z - zone.position[1]);
      if (d < zone.triggerRadius && d < closestDistance) {
        closest = zone;
        closestDistance = d;
      }
    }
    const closestId = closest?.id ?? null;
    if (closestId !== nearZone) {
      worldStore.set({ nearZone: closestId });
      // Al llegar a un lugar, su tarjeta se abre sola y la moto se detiene.
      if (closestId) {
        player.speed = 0;
        openZone(closestId);
      }
    }

    // Moto: posición, inclinación en curvas y ruedas
    if (root.current && moto.current) {
      root.current.position.copy(player.position);
      root.current.rotation.y = player.heading;
      // Detenido, Jhon apoya el pie izquierdo y la moto se recuesta un poco hacia ese lado.
      stopped.current = MathUtils.damp(stopped.current, Math.abs(player.speed) < 0.6 ? 1 : 0, 5, dt);
      const lean = -steer * MathUtils.clamp(player.speed / MAX_SPEED, -1, 1) * 0.35 - stopped.current * 0.1;
      moto.current.rotation.z = MathUtils.damp(moto.current.rotation.z, lean, 6, dt);
      const spin = (player.speed * dt) / 0.36;
      moto.current.getObjectByName('front-wheel')?.rotateX(spin);
      moto.current.getObjectByName('rear-wheel')?.rotateX(spin);

      const leg = moto.current.getObjectByName('rider-leg-left');
      const shin = moto.current.getObjectByName('rider-shin-left');
      const body = moto.current.getObjectByName('rider-body');
      const head = moto.current.getObjectByName('rider-head');
      if (leg) leg.rotation.set(stopped.current * 0.95, 0, stopped.current * 0.32);
      if (shin) shin.rotation.x = -stopped.current * 0.35;
      const accelerating = canDrive && input.forward ? 1 : 0;
      if (body) {
        body.rotation.x = MathUtils.damp(body.rotation.x, accelerating * 0.12 - stopped.current * 0.06, 4, dt);
        // Respiración leve.
        body.position.y = 1.1 + Math.sin(performance.now() / 700) * 0.008;
      }
      // Mira hacia donde gira; quieto, mira a los lados de vez en cuando.
      if (head) head.rotation.y = MathUtils.damp(head.rotation.y, steer * 0.4 + stopped.current * Math.sin(performance.now() / 1600) * 0.5, 4, dt);
    }

    // Cámara: vuelo lento alrededor de la isla en la intro, luego sigue la moto.
    if (!started) {
      introAngle.current += dt * 0.08;
      desiredCamera.set(Math.sin(introAngle.current) * 95, 55, Math.cos(introAngle.current) * 95);
      lookAt.set(0, 0, 0);
    } else {
      // Cámara de persecución: gira suavemente detrás de la moto.
      const yawDiff = Math.atan2(Math.sin(player.heading - cameraYaw.current), Math.cos(player.heading - cameraYaw.current));
      cameraYaw.current += yawDiff * (1 - Math.exp(-dt * 2.5));
      // En pantallas verticales (celular) la cámara se aleja para ver más del barrio.
      const zoom = (camera as PerspectiveCamera).aspect < 1 ? 1.45 : 1;
      const back = cameraOffset.z * zoom;
      desiredCamera.set(
        player.position.x - Math.sin(cameraYaw.current) * back,
        cameraOffset.y * zoom,
        player.position.z - Math.cos(cameraYaw.current) * back,
      );
      // Mira un poco adelante de la moto para ver hacia dónde va.
      lookAt.set(player.position.x + Math.sin(cameraYaw.current) * 4, 1, player.position.z + Math.cos(cameraYaw.current) * 4);
    }
    const follow = started ? 1 - Math.exp(-dt * 4) : 1;
    // Cámara fija para revisar modelos de cerca (solo en desarrollo: window.__cam = { pos, look }).
    const debugCam = import.meta.env.DEV ? (window as unknown as { __cam?: { pos: number[]; look: number[] } }).__cam : undefined;
    if (debugCam) {
      camera.position.set(debugCam.pos[0], debugCam.pos[1], debugCam.pos[2]);
      camera.lookAt(debugCam.look[0], debugCam.look[1], debugCam.look[2]);
      return;
    }
    camera.position.lerp(desiredCamera, follow);
    currentLook.lerp(lookAt, follow);
    camera.lookAt(currentLook);
  });

  return (
    <group ref={root}>
      <Moto ref={moto} />
    </group>
  );
}
