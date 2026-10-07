import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { FiExternalLink, FiGithub, FiLinkedin, FiMail, FiDownload } from 'react-icons/fi';
import cv from '../assets/CV_Jhon_Hernandez.pdf';
import { contactLinks, featuredProject, projects, skillCategories, type Project } from '../data/portfolio';
import type { ZoneId } from '../world/zones';

/**
 * Contenido de cada sección del portafolio. Lo usan las tarjetas del mundo 3D
 * y el modo rápido, para que ambos cuenten lo mismo con el mismo estilo.
 */

export const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 20, stiffness: 220 } },
};

/** Bloque que entra animado, en cascada con sus hermanos. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

function GameCover({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <motion.article
      whileHover={{ y: -4, rotate: featured ? 0 : -0.6 }}
      className={`overflow-hidden rounded-2xl bg-gray-900 text-white shadow-lg ring-1 ring-white/10 ${featured ? 'sm:col-span-2' : ''}`}
    >
      <div className="relative aspect-video">
        <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />
        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
            Juego destacado
          </span>
        )}
        <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold">{project.title}</h3>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm text-gray-300">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span key={tech} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          <a href={project.demo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-cyan-400 px-3 py-1.5 text-gray-900 hover:bg-cyan-300">
            <FiExternalLink /> Jugar demo
          </a>
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20">
            <FiGithub /> Código
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function ProjectsContent() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Reveal className="sm:col-span-2">
        <GameCover project={featuredProject} featured />
      </Reveal>
      {projects.map((project) => (
        <Reveal key={project.title}>
          <GameCover project={project} />
        </Reveal>
      ))}
    </div>
  );
}

const average = (values: number[]) => Math.round(values.reduce((a, b) => a + b, 0) / values.length);
const chipColors = [
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200',
  'bg-sky-100 text-sky-800 dark:bg-sky-400/15 dark:text-sky-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200',
  'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-400/15 dark:text-rose-200',
];

function SkillsContent() {
  const stats = skillCategories.map((category) => ({
    ...category,
    value: average(category.skills.map((skill) => skill.level)),
  }));
  const overall = average(stats.map((stat) => stat.value));

  return (
    <div className="space-y-6">
      {/* Carta estilo Ultimate Team en blanco y dorado */}
      <Reveal>
        <motion.div
          className="mx-auto w-64 rounded-[2rem] bg-gradient-to-b from-[#f9f3d9] via-[#e8cf7a] to-[#b8902b] p-1 shadow-2xl shadow-amber-500/40"
          initial={{ rotateY: 90 }}
          animate={{ rotateY: 0 }}
          transition={{ type: 'spring', damping: 14, delay: 0.25 }}
          whileHover={{ scale: 1.04, rotate: -1.5 }}
        >
          <div className="rounded-[1.8rem] bg-gradient-to-b from-white to-[#f3e3a6] px-5 pb-5 pt-4 text-[#3d2f00]">
            <div className="flex items-start justify-between">
              <div className="text-center leading-none">
                <div className="text-5xl font-black">{overall}</div>
                <div className="mt-1 text-sm font-bold">FS</div>
                <div className="mx-auto mt-2 h-4 w-6 overflow-hidden rounded-sm">
                  <div className="h-1/2 bg-[#fcd116]" />
                  <div className="h-1/4 bg-[#003893]" />
                  <div className="h-1/4 bg-[#ce1126]" />
                </div>
              </div>
              <div className="text-6xl">🧑🏻‍💻</div>
            </div>
            <div className="mt-3 border-b border-[#b8902b]/50 pb-2 text-center text-2xl font-black tracking-wide">JHON</div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {stats.map((stat) => (
                <div key={stat.short} className="flex justify-between font-bold">
                  <span>{stat.value}</span>
                  <span className="font-semibold opacity-80">{stat.short}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold">
                <span>99</span>
                <span className="font-semibold opacity-80">GAN</span>
              </div>
            </div>
          </div>
        </motion.div>
        <p className="mt-3 text-center text-xs text-emerald-900/60 dark:text-emerald-200/60">FS = Full Stack · GAN = ganas de aprender</p>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2">
        {skillCategories.map((category, i) => (
          <Reveal key={category.title} className="rounded-2xl bg-white dark:bg-white/[0.06] p-4 shadow-sm ring-1 ring-emerald-900/5 dark:ring-white/10">
            <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{category.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              {category.skills.map((skill) => (
                <span key={skill.name} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipColors[i % chipColors.length]}`}>
                  {skill.name} {skill.level}
                </span>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function AboutContent() {
  const traits = ['💡 Apasionado por la tecnología', '📚 Autodidacta', '🚀 Muy proactivo', '🛰️ A la vanguardia'];

  const career = [
    {
      place: 'Empresa privada',
      time: '2 años y medio',
      color: 'from-sky-500 to-cyan-400',
      detail: 'Desarrollé la plataforma web que recauda el impuesto vehicular de Santander, Risaralda y Caquetá.',
    },
    {
      place: 'Policía Nacional · Salud',
      time: 'Contratista',
      color: 'from-emerald-500 to-lime-400',
      detail: 'Construí el módulo de costos y después los módulos de primera infancia y psicología.',
    },
    {
      place: 'Policía Nacional · Bienestar',
      time: 'Contratista',
      color: 'from-violet-500 to-fuchsia-400',
      detail: 'Desarrollé la web de los colegios de la PONAL.',
    },
    {
      place: 'Novasoft',
      time: 'Actualmente',
      color: 'from-orange-500 to-rose-500',
      detail: 'Implemento nuevos requerimientos en un software de nómina.',
    },
  ];

  const passions = ['🎮 Gamer', '▶️ Ex youtuber', '⚽ Madridista y con la Selección', '🏋️ Gimnasio', '🐾 Amante de los animales', '🏍️ Moto y carro'];

  return (
    <div className="space-y-6">
      <Reveal className="rounded-3xl bg-white dark:bg-white/[0.06] p-5 shadow-sm ring-1 ring-orange-900/5 dark:ring-white/10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/30">
            <span className="text-2xl font-black leading-none">5</span>
            <span className="text-[10px] font-bold uppercase">años</span>
          </div>
          <p className="text-gray-700 dark:text-white/75">
            Soy <strong>ingeniero de sistemas</strong> con <strong>5 años de experiencia</strong>. He trabajado en empresas privadas y públicas, manejo <strong>.NET</strong> y <strong>Azure</strong>, y busco estar siempre a la vanguardia de la tecnología.
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {traits.map((trait) => (
            <span key={trait} className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800 dark:bg-orange-500/15 dark:text-orange-200">
              {trait}
            </span>
          ))}
        </div>
      </Reveal>

      <div>
        <Reveal>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Mi entrenamiento profesional</h3>
        </Reveal>
        <ol className="relative space-y-4 border-l-2 border-dashed border-orange-300 dark:border-orange-400/40 pl-6">
          {career.map((step, i) => (
            <motion.li key={step.place} variants={item} className="relative">
              <span className={`absolute -left-[37px] top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-xs font-black text-white shadow-md`}>
                {i + 1}
              </span>
              <div className="rounded-2xl bg-white dark:bg-white/[0.06] p-4 shadow-sm ring-1 ring-orange-900/5 dark:ring-white/10">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{step.place}</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-white/50">{step.time}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-white/60">{step.detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <Reveal>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">Fuera del código</h3>
        <div className="flex flex-wrap gap-2">
          {passions.map((passion) => (
            <span key={passion} className="rounded-full bg-white dark:bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-white/75 shadow-sm ring-1 ring-orange-900/5 dark:ring-white/10">
              {passion}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function FoundationContent() {
  return (
    <div className="space-y-5">
      <Reveal className="flex items-center gap-4 rounded-3xl bg-white dark:bg-white/[0.06] p-5 shadow-sm ring-1 ring-rose-900/5 dark:ring-white/10">
        <motion.span className="text-5xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>
          🐕
        </motion.span>
        <p className="text-gray-700 dark:text-white/75">
          Este es <strong>Tyson</strong>, mi pastor alemán. Una de mis metas a largo plazo es crear una <strong>fundación para perros y gatos</strong>, y unir la tecnología con esa causa.
        </p>
      </Reveal>
      <Reveal>
        <GameCover project={featuredProject} featured />
      </Reveal>
    </div>
  );
}

function ContactContent() {
  const links = [
    { label: 'Email', value: contactLinks.email, href: `mailto:${contactLinks.email}`, icon: <FiMail />, color: 'from-amber-400 to-orange-500' },
    { label: 'LinkedIn', value: 'jhon-gomez', href: contactLinks.linkedin, icon: <FiLinkedin />, color: 'from-sky-500 to-blue-600' },
    { label: 'GitHub', value: 'ingjhonhernandezgomez', href: contactLinks.github, icon: <FiGithub />, color: 'from-gray-700 to-gray-900' },
  ];

  return (
    <div className="space-y-4">
      <Reveal>
        <p className="text-gray-700 dark:text-white/75">¿Tienes una idea o un proyecto? Prendamos motores y construyámoslo juntos.</p>
      </Reveal>
      {links.map((link) => (
        <Reveal key={link.label}>
          <a
            href={link.href}
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl bg-white dark:bg-white/[0.06] p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-xl text-white`}>{link.icon}</span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/50">{link.label}</span>
              <span className="font-semibold text-gray-900 dark:text-white">{link.value}</span>
            </span>
          </a>
        </Reveal>
      ))}
      <Reveal>
        <a href={cv} download className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 p-4 font-bold text-gray-900 shadow-lg shadow-amber-500/30 hover:brightness-105">
          <FiDownload /> Descargar mi hoja de vida
        </a>
      </Reveal>
    </div>
  );
}

export type Theme = { header: string; body: string; tagline: string; content: () => JSX.Element };

export const themes: Record<ZoneId, Theme> = {
  proyectos: {
    header: 'from-violet-700 via-fuchsia-600 to-cyan-500',
    body: 'bg-gradient-to-b from-violet-50 to-white',
    tagline: 'Mi biblioteca de juegos',
    content: ProjectsContent,
  },
  habilidades: {
    header: 'from-emerald-700 via-green-500 to-amber-400',
    body: 'bg-gradient-to-b from-emerald-50 to-white',
    tagline: 'Mi carta de jugador',
    content: SkillsContent,
  },
  'sobre-mi': {
    header: 'from-orange-600 via-amber-500 to-rose-500',
    body: 'bg-gradient-to-b from-orange-50 to-white',
    tagline: 'Disciplina dentro y fuera del código',
    content: AboutContent,
  },
  fundacion: {
    header: 'from-rose-600 via-pink-500 to-amber-400',
    body: 'bg-gradient-to-b from-rose-50 to-white',
    tagline: 'Tyson y una meta con corazón',
    content: FoundationContent,
  },
  contacto: {
    header: 'from-slate-900 via-slate-700 to-yellow-500',
    body: 'bg-gradient-to-b from-slate-100 to-white',
    tagline: 'Prendamos motores juntos',
    content: ContactContent,
  },
};

