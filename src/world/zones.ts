export type ZoneId = 'proyectos' | 'habilidades' | 'sobre-mi' | 'fundacion' | 'contacto';

export type Zone = {
  id: ZoneId;
  /** Nombre del lugar dentro del mundo. */
  place: string;
  /** Sección del portafolio que se abre al entrar. */
  section: string;
  emoji: string;
  /** Posición en el plano (x, z). */
  position: [number, number];
  /** Distancia a la que aparece el botón para entrar. */
  triggerRadius: number;
  /** Distancia desde el centro del lugar donde termina la calle, para no invadirlo. */
  roadEnd: number;
  achievement: string;
};

export const zones: Zone[] = [
  {
    id: 'proyectos',
    place: 'Sala gamer',
    section: 'Proyectos',
    emoji: '🎮',
    position: [-34, -32],
    triggerRadius: 11,
    roadEnd: 6.5,
    achievement: 'Player One: encontraste la sala gamer',
  },
  {
    id: 'habilidades',
    place: 'La cancha',
    section: 'Habilidades',
    emoji: '⚽',
    position: [34, -32],
    triggerRadius: 13,
    roadEnd: 10,
    achievement: '¡Golazo! Llegaste a la cancha',
  },
  {
    id: 'sobre-mi',
    place: 'Gimnasio',
    section: 'Sobre mí',
    emoji: '💪',
    position: [-38, 24],
    triggerRadius: 11,
    roadEnd: 6.8,
    achievement: 'Sin excusas: visitaste el gimnasio',
  },
  {
    id: 'fundacion',
    place: 'Refugio',
    section: 'Fundación',
    emoji: '🐾',
    position: [38, 24],
    triggerRadius: 13,
    roadEnd: 6.2,
    achievement: 'Corazón peludo: conociste el refugio',
  },
  {
    id: 'contacto',
    place: 'Garaje',
    section: 'Contacto',
    emoji: '🚗',
    position: [0, 46],
    triggerRadius: 11,
    roadEnd: 10,
    achievement: 'Motor encendido: llegaste al garaje',
  },
];

export const zoneById = Object.fromEntries(zones.map((zone) => [zone.id, zone])) as Record<ZoneId, Zone>;

/** Ángulo para que un objeto que mira hacia +Z quede de frente a la plaza central. */
export function facingCenter([x, z]: [number, number]) {
  return Math.atan2(-x, -z);
}

export const WORLD_RADIUS = 72;
/** Radio de la avenida circular que conecta las zonas. */
export const RING_RADIUS = 26;
