import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { playBark, playStart, unlockAudio } from '../audio';
import { useWorld, worldStore } from '../store';

const start = () => {
  unlockAudio();
  playStart();
  window.setTimeout(playBark, 900);
  worldStore.set({ started: true });
};

/** Pantalla de inicio estilo videojuego. */
export function Intro({ onQuickMode }: { onQuickMode: () => void }) {
  const started = useWorld((s) => s.started);
  const ready = useWorld((s) => s.ready);

  useEffect(() => {
    if (started || !ready) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Enter' || event.code === 'Space') start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, ready]);

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#0d0b1e] px-6 text-center text-white"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-4xl">🏍️🐕</div>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">Preparando el mundo de Jhon</p>
          <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-amber-300 to-amber-500" />
          </div>
          <button onClick={onQuickMode} className="mt-8 text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
            ¿Con prisa? Ver el modo rápido sin 3D
          </button>
        </motion.div>
      )}
      {ready && !started && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#0d0b1e]/80 via-[#1b1240]/60 to-[#0d0b1e]/85 px-6 text-center text-white"
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="mb-3 text-xs font-bold uppercase tracking-[0.4em] text-cyan-300 sm:text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Ingeniero de sistemas · Gamer · Futbolero
          </motion.p>
          <motion.h1
            className="text-5xl font-black leading-none sm:text-7xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 0.35 }}
          >
            El mundo
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">de Jhon</span>
          </motion.h1>
          <motion.p
            className="mt-5 max-w-md text-base text-white/80 sm:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Súbete a mi moto, recorre mi barrio con Tyson y descubre lo que hago.
          </motion.p>
          <motion.button
            onClick={start}
            className="mt-10 rounded-2xl border-2 border-white px-10 py-4 text-xl font-black tracking-[0.3em] hover:bg-white hover:text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.35, 1] }}
            transition={{ delay: 0.9, duration: 1.6, repeat: Infinity, repeatType: 'mirror' }}
          >
            PRESS START
          </motion.button>
          <button onClick={onQuickMode} className="mt-8 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
            ¿Con prisa? Ver el modo rápido sin 3D
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
