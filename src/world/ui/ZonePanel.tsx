import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { container, themes } from '../../content/sections';
import { useWorld, worldStore } from '../store';
import { zoneById } from '../zones';

const close = () => worldStore.set({ openZone: null });

export function ZonePanel() {
  const openZone = useWorld((s) => s.openZone);

  useEffect(() => {
    if (!openZone) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openZone]);

  const zone = openZone ? zoneById[openZone] : null;
  const theme = openZone ? themes[openZone] : null;

  return (
    <AnimatePresence>
      {zone && theme && (
        <motion.div key={zone.id} className="fixed inset-0 z-40 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Cerrar" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={close} />
          <motion.aside
            role="dialog"
            aria-label={zone.section}
            className={`relative h-full w-full max-w-xl overflow-y-auto shadow-2xl sm:rounded-l-3xl ${theme.body}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          >
            {/* Encabezado con el color del lugar */}
            <header className={`relative overflow-hidden bg-gradient-to-br ${theme.header} px-6 pb-8 pt-6 text-white sm:px-8`}>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
              <div className="absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">{zone.place}</div>
                  <h2 className="mt-1 text-4xl font-black drop-shadow-sm">{zone.section}</h2>
                  <p className="mt-1 text-sm font-medium text-white/85">{theme.tagline}</p>
                </div>
                <button onClick={close} aria-label="Cerrar" className="rounded-full bg-white/20 p-2 text-xl text-white backdrop-blur hover:bg-white/30">
                  <FiX />
                </button>
              </div>
              <motion.div
                className="absolute bottom-2 right-8 text-6xl drop-shadow-lg"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0, y: [0, -6, 0] }}
                transition={{ scale: { type: 'spring', delay: 0.2 }, rotate: { type: 'spring', delay: 0.2 }, y: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } }}
              >
                {zone.emoji}
              </motion.div>
            </header>
            <motion.div className="p-6 sm:p-8" variants={container} initial="hidden" animate="show">
              <theme.content />
            </motion.div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
