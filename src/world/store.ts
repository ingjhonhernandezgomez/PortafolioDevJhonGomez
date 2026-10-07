import { useSyncExternalStore } from 'react';
import { Vector3 } from 'three';
import { playAchievement } from './audio';
import { zoneById, zones, type ZoneId } from './zones';

export type WorldState = {
  /** La escena ya se dibujó por primera vez (shaders listos). */
  ready: boolean;
  started: boolean;
  nearZone: ZoneId | null;
  openZone: ZoneId | null;
  visited: ZoneId[];
  /** El visitante ya movió la moto al menos una vez. */
  hasMoved: boolean;
  toast: { id: number; text: string } | null;
};

let state: WorldState = {
  ready: false,
  started: false,
  nearZone: null,
  openZone: null,
  visited: [],
  hasMoved: false,
  toast: null,
};

const listeners = new Set<() => void>();

export const worldStore = {
  get: () => state,
  set(partial: Partial<WorldState>) {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useWorld<T>(selector: (s: WorldState) => T): T {
  return useSyncExternalStore(worldStore.subscribe, () => selector(worldStore.get()));
}

let toastId = 0;

export function showToast(text: string) {
  worldStore.set({ toast: { id: ++toastId, text } });
}

/** Marca una zona como visitada y desbloquea su logro la primera vez. */
export function visitZone(id: ZoneId) {
  const { visited } = worldStore.get();
  if (visited.includes(id)) return;
  const next = [...visited, id];
  worldStore.set({ visited: next });
  playAchievement();
  showToast(
    next.length === zones.length
      ? '¡Explorador total! Conociste todo el mundo de Jhon'
      : zoneById[id].achievement,
  );
}

export function openZone(id: ZoneId) {
  visitZone(id);
  worldStore.set({ openZone: id });
}

/** Estado de la moto, mutado en cada frame (fuera de React para no re-renderizar). */
export const player = {
  position: new Vector3(0, 0, 18),
  heading: Math.PI,
  speed: 0,
};

// Acceso de depuración en desarrollo (no se incluye en el build de producción).
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__world = { worldStore, player, openZone };
}
