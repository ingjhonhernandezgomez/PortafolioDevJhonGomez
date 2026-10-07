import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sound, unlockAudio } from '../audio';
import { input, type InputKey } from '../input';
import { openZone, useWorld, worldStore } from '../store';
import { zoneById, zones } from '../zones';

function Toast() {
  const toast = useWorld((s) => s.toast);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      if (worldStore.get().toast?.id === toast.id) worldStore.set({ toast: null });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[45] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-3 rounded-2xl bg-gray-900/90 px-4 py-3 text-white shadow-2xl ring-1 ring-amber-400/60"
          >
            <span className="text-2xl">🏆</span>
            <span>
              <span className="block text-[11px] font-bold uppercase tracking-widest text-amber-300">Logro desbloqueado</span>
              <span className="text-sm font-semibold">{toast.text}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TouchButton({ control, label }: { control: InputKey; label: string }) {
  const set = (value: boolean) => () => {
    input[control] = value;
  };
  return (
    <button
      aria-label={label}
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onPointerCancel={set(false)}
      onContextMenu={(event) => event.preventDefault()}
      className="h-16 w-16 select-none rounded-2xl bg-white/80 text-2xl font-bold text-gray-900 shadow-lg backdrop-blur active:scale-95 active:bg-white"
      style={{ touchAction: 'none' }}
    >
      {label}
    </button>
  );
}

function TouchControls() {
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-6 z-20 flex justify-between px-5">
      <div className="flex gap-3">
        <TouchButton control="left" label="◀" />
        <TouchButton control="right" label="▶" />
      </div>
      <div className="flex gap-3">
        <TouchButton control="back" label="▼" />
        <TouchButton control="forward" label="▲" />
      </div>
    </div>
  );
}

export function Hud({ onQuickMode }: { onQuickMode: () => void }) {
  const nearZone = useWorld((s) => s.nearZone);
  const panelOpen = useWorld((s) => s.openZone !== null);
  const visitedCount = useWorld((s) => s.visited.length);
  const hasMoved = useWorld((s) => s.hasMoved);
  const [isTouch] = useState(() => window.matchMedia('(pointer: coarse)').matches);
  const muted = useSyncExternalStore(sound.subscribe, sound.isMuted);

  // Enter o E para entrar a la zona cercana.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const { nearZone: zone, openZone: open } = worldStore.get();
      if (!zone || open) return;
      if (event.code === 'KeyE' || event.code === 'Enter') openZone(zone);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
        <div className="rounded-2xl bg-white/85 px-4 py-2 shadow-lg backdrop-blur">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gray-500">El mundo de</div>
          <div className="text-lg font-black leading-tight text-gray-900">Jhon Hernández</div>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <div className="rounded-full bg-gray-900/85 px-3 py-1.5 text-sm font-semibold text-white shadow-lg" title="Lugares descubiertos">
            🏆 {visitedCount}/{zones.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                unlockAudio();
                sound.setMuted(!muted);
              }}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className="rounded-full bg-white/85 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur hover:bg-white"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button onClick={onQuickMode} className="rounded-full bg-white/85 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-lg backdrop-blur hover:bg-white">
              ⚡ Modo rápido
            </button>
          </div>
        </div>
      </div>

      <Toast />

      <AnimatePresence>
        {nearZone && !panelOpen && (
          <motion.div
            className={`fixed inset-x-0 z-20 flex justify-center px-4 ${isTouch ? 'bottom-28' : 'bottom-10'}`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
          >
            <button
              onClick={() => openZone(nearZone)}
              className="flex items-center gap-3 rounded-2xl bg-gray-900 px-5 py-3 text-white shadow-2xl ring-2 ring-white/40 hover:scale-105"
            >
              <span className="text-2xl">{zoneById[nearZone].emoji}</span>
              <span className="text-left">
                <span className="block text-xs text-gray-300">{zoneById[nearZone].place}</span>
                <span className="font-bold">Ver {zoneById[nearZone].section}</span>
              </span>
              {!isTouch && <kbd className="rounded-md bg-white/15 px-2 py-0.5 text-xs">Enter</kbd>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isTouch && !hasMoved && !panelOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-10 z-10 flex justify-center">
          <div className="rounded-2xl bg-white/85 px-4 py-2 text-sm font-medium text-gray-700 shadow-lg backdrop-blur">
            Maneja con <kbd className="font-bold">W A S D</kbd> o las flechas · <kbd className="font-bold">Shift</kbd> para turbo · o toca los letreros
          </div>
        </div>
      )}

      {isTouch && !panelOpen && <TouchControls />}

      {/* Créditos que pide la licencia CC-BY del modelo de Tyson */}
      <div className="pointer-events-none fixed bottom-1 right-2 z-10 text-[10px] text-white/70 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
        Tyson 3D: Quaternius (CC-BY) · Auto: Kenney · Texturas: Poly Haven
      </div>
    </>
  );
}
