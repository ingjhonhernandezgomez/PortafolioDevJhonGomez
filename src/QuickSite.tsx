import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import { container, themes } from './content/sections';
import { contactLinks } from './data/portfolio';
import type { ZoneId } from './world/zones';

type QuickSiteProps = {
  /** Si existe, muestra el botón para ir al mundo 3D. */
  onOpenWorld?: () => void;
};

const sections: { id: ZoneId; title: string; emoji: string }[] = [
  { id: 'sobre-mi', title: 'Sobre mí', emoji: '💪' },
  { id: 'proyectos', title: 'Proyectos', emoji: '🎮' },
  { id: 'habilidades', title: 'Habilidades', emoji: '⚽' },
  { id: 'fundacion', title: 'Fundación', emoji: '🐾' },
  { id: 'contacto', title: 'Contacto', emoji: '🚗' },
];

function Nav({ onOpenWorld }: QuickSiteProps) {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0b1e]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2 font-black text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-sm">JH</span>
          <span className="hidden sm:inline">Jhon Hernández</span>
        </a>
        <div className="hidden items-center gap-1 md:flex">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
              {section.title}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {onOpenWorld && (
            <button
              onClick={onOpenWorld}
              className="rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2 text-sm font-bold text-gray-900 shadow-lg shadow-amber-500/20 transition hover:scale-105"
            >
              🏍️ Mundo 3D
            </button>
          )}
          <button onClick={() => setOpen(!open)} aria-label="Menú" className="rounded-full p-2 text-xl text-white md:hidden">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-1 border-t border-white/10 px-4 py-3 md:hidden">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 font-medium text-white/80 hover:bg-white/10">
              {section.emoji} {section.title}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function Hero({ onOpenWorld }: QuickSiteProps) {
  const chips = ['🎮 Gamer', '⚽ Madridista', '🏋️ Gym', '🐕 Tyson', '🏍️ Pulsar NS'];
  return (
    <section id="inicio" className="relative overflow-hidden bg-[#0d0b1e] pb-24 pt-32 text-white sm:pt-40">
      {/* Luces de fondo animadas */}
      <motion.div
        className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-fuchsia-600/30 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-cyan-500/25 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-cyan-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Ingeniero de sistemas · 5 años de experiencia
          </span>
          <h1 className="mt-6 text-5xl font-black leading-[1.05] sm:text-6xl lg:text-7xl">
            Hola, soy Jhon.
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Construyo software que se siente bien.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Apasionado por la tecnología, autodidacta y muy proactivo. He creado plataformas para el sector público y privado, y hoy desarrollo software de nómina en Novasoft.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#proyectos" className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-bold text-gray-900 transition hover:scale-105">
              Ver proyectos <FiArrowRight className="transition group-hover:translate-x-1" />
            </a>
            <a href={`mailto:${contactLinks.email}`} className="rounded-2xl border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10">
              Escríbeme
            </a>
            {onOpenWorld && (
              <button onClick={onOpenWorld} className="rounded-2xl px-6 py-3 font-bold text-amber-300 transition hover:bg-white/5">
                🏍️ Recorrer mi mundo 3D
              </button>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip, i) => (
              <motion.span
                key={chip}
                className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                {chip}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Tarjeta tipo editor con mi "configuración" */}
        <motion.div
          className="relative rounded-3xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur"
          initial={{ opacity: 0, rotate: 4, y: 40 }}
          animate={{ opacity: 1, rotate: 2, y: [0, -10, 0] }}
          transition={{ opacity: { delay: 0.3 }, rotate: { delay: 0.3 }, y: { delay: 1, duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <div className="rounded-[1.3rem] bg-[#141127] p-5 font-mono text-sm leading-relaxed">
            <div className="mb-4 flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <p>
              <span className="text-fuchsia-400">const</span> <span className="text-cyan-300">jhon</span> = {'{'}
            </p>
            <p className="pl-4">
              rol: <span className="text-amber-300">'Ingeniero de sistemas'</span>,
            </p>
            <p className="pl-4">
              experiencia: <span className="text-emerald-300">5</span>,
            </p>
            <p className="pl-4">
              stack: [<span className="text-amber-300">'.NET'</span>, <span className="text-amber-300">'Azure'</span>, <span className="text-amber-300">'React'</span>],
            </p>
            <p className="pl-4">
              equipo: <span className="text-amber-300">'Real Madrid'</span>,
            </p>
            <p className="pl-4">
              mejorAmigo: <span className="text-amber-300">'Tyson 🐕'</span>,
            </p>
            <p className="pl-4">
              meta: <span className="text-amber-300">'Fundación para animales'</span>,
            </p>
            <p>{'};'}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Section({ id }: { id: ZoneId }) {
  const theme = themes[id];
  const meta = sections.find((section) => section.id === id)!;
  return (
    <section id={id} className="relative scroll-mt-20 px-4 py-14 sm:px-6">
      {/* Resplandor del color de la sección detrás de la tarjeta */}
      <div className={`pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${theme.header} opacity-20 blur-3xl`} />
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-[#15122b]/80 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur">
        <header className={`relative overflow-hidden bg-gradient-to-br ${theme.header} px-6 py-8 text-white sm:px-10`}>
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <motion.div
            className="absolute bottom-3 right-8 text-6xl drop-shadow-lg sm:text-7xl"
            initial={{ scale: 0, rotate: -30 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            {meta.emoji}
          </motion.div>
          <h2 className="relative text-4xl font-black sm:text-5xl">{meta.title}</h2>
          <p className="relative mt-1 font-medium text-white/85">{theme.tagline}</p>
        </header>
        <motion.div className="p-6 sm:p-10" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <theme.content />
        </motion.div>
      </div>
    </section>
  );
}

/** Versión rápida del portafolio, sin 3D, con el mismo contenido y estilo de las tarjetas. */
function QuickSite({ onOpenWorld }: QuickSiteProps) {
  return (
    // "dark" activa la versión oscura del contenido compartido con las tarjetas del mundo 3D.
    <div className="dark min-h-screen bg-[#0d0b1e] text-white">
      <Nav onOpenWorld={onOpenWorld} />
      <Hero onOpenWorld={onOpenWorld} />
      <main className="-mt-10">
        {sections.map((section) => (
          <Section key={section.id} id={section.id} />
        ))}
      </main>
      <footer className="px-4 pb-10 pt-4 text-center text-sm text-white/50">
        Hecho con 💜 por Jhon Hernández · {new Date().getFullYear()}
        <span className="mt-2 block text-xs text-white/35">
          Modelo 3D de Tyson: "German Shepard" de Quaternius (CC-BY 3.0, vía poly.pizza) · Auto: Kenney (CC0) · Texturas: Poly Haven (CC0)
        </span>
        {onOpenWorld && (
          <>
            {' · '}
            <button onClick={onOpenWorld} className="font-semibold text-violet-300 hover:underline">
              Ver el mundo 3D
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

export default QuickSite;
