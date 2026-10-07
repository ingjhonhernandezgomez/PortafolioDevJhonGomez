import { audioGraph } from './audio';
import type { ZoneId } from './zones';

/**
 * Ambiente musical de cada lugar: una pista corta en bucle, generada en el
 * navegador, que suena suave mientras estás cerca y se desvanece al alejarte.
 */

type Voice = (ctx: AudioContext, out: AudioNode, time: number) => void;

function note(ctx: AudioContext, out: AudioNode, time: number, frequency: number, duration: number, type: OscillatorType, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain).connect(out);
  osc.start(time);
  osc.stop(time + duration + 0.05);
}

let noiseBuffer: AudioBuffer | null = null;
function getNoise(ctx: AudioContext) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

function hit(ctx: AudioContext, out: AudioNode, time: number, duration: number, volume: number, type: BiquadFilterType, frequency: number) {
  const source = ctx.createBufferSource();
  source.buffer = getNoise(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.connect(filter).connect(gain).connect(out);
  source.start(time, Math.random() * 0.5);
  source.stop(time + duration + 0.05);
}

function drum(ctx: AudioContext, out: AudioNode, time: number, from: number, to: number, length: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(from, time);
  osc.frequency.exponentialRampToValueAtTime(to, time + length * 0.6);
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
  osc.connect(gain).connect(out);
  osc.start(time);
  osc.stop(time + length + 0.05);
}

const kick: Voice = (ctx, out, time) => drum(ctx, out, time, 140, 42, 0.3, 0.45);
const hat: Voice = (ctx, out, time) => hit(ctx, out, time, 0.05, 0.07, 'highpass', 7000);
const clap: Voice = (ctx, out, time) => hit(ctx, out, time, 0.16, 0.16, 'bandpass', 1500);
const snare: Voice = (ctx, out, time) => {
  hit(ctx, out, time, 0.18, 0.18, 'highpass', 1800);
  note(ctx, out, time, 190, 0.1, 'triangle', 0.1);
};
/** Bombo de tribuna: más grave y largo que un bombo electrónico. */
const stadiumDrum: Voice = (ctx, out, time) => {
  drum(ctx, out, time, 90, 48, 0.5, 0.5);
  hit(ctx, out, time, 0.08, 0.07, 'lowpass', 600);
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

type Track = {
  bpm: number;
  /** Largo del bucle en semicorcheas. */
  steps: number;
  step: (ctx: AudioContext, out: AudioNode, time: number, index: number, stepLength: number) => void;
  /** Capa continua opcional (por ejemplo, el murmullo de la tribuna). */
  bed?: (ctx: AudioContext, out: AudioNode) => () => void;
};

const tracks: Record<ZoneId, Track> = {
  // Sala gamer: melodía chiptune de 8 bits con bajo.
  proyectos: {
    bpm: 132,
    steps: 64,
    step: (ctx, out, time, i, len) => {
      const chords = [
        [60, 64, 67, 72],
        [57, 60, 64, 69],
        [53, 57, 60, 65],
        [55, 59, 62, 67],
      ];
      const chord = chords[Math.floor(i / 16) % 4];
      note(ctx, out, time, hz(chord[i % 4] + 12), len * 0.9, 'square', 0.03);
      if (i % 4 === 0) note(ctx, out, time, hz(chord[0] - 12), len * 3.5, 'triangle', 0.12);
      if (i % 8 === 4) hat(ctx, out, time);
      const lead = [72, -1, 76, 79, -1, 77, 76, -1, 74, -1, 72, 74, 76, -1, 72, -1];
      const m = lead[i % 16];
      if (m > 0 && Math.floor(i / 16) % 2 === 1) note(ctx, out, time, hz(m), len * 1.6, 'square', 0.028);
    },
  },
  // La cancha: murmullo de tribuna, bombo "pum, pum, pum-pum-pum", palmas y un "oe" del coro.
  habilidades: {
    bpm: 112,
    steps: 32,
    step: (ctx, out, time, i) => {
      const s = i % 16;
      if ([0, 4, 8, 10, 12].includes(s)) stadiumDrum(ctx, out, time);
      if ([2, 6].includes(s)) clap(ctx, out, time);
      if (s === 8 && i >= 16) {
        note(ctx, out, time, hz(64), 0.5, 'sawtooth', 0.022);
        note(ctx, out, time + 0.27, hz(67), 0.6, 'sawtooth', 0.022);
      }
    },
    bed: (ctx, out) => {
      const source = ctx.createBufferSource();
      source.buffer = getNoise(ctx);
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      const swell = ctx.createOscillator();
      const depth = ctx.createGain();
      swell.frequency.value = 0.12;
      depth.gain.value = 0.025;
      swell.connect(depth).connect(gain.gain);
      source.connect(filter).connect(gain).connect(out);
      source.start();
      swell.start();
      return () => {
        source.stop();
        swell.stop();
      };
    },
  },
  // Gimnasio: ritmo de entrenamiento con bombo en cada tiempo y bajo pulsante.
  'sobre-mi': {
    bpm: 124,
    steps: 32,
    step: (ctx, out, time, i, len) => {
      const s = i % 16;
      if (s % 4 === 0) kick(ctx, out, time);
      if (s % 4 === 2) hat(ctx, out, time);
      if (s === 4 || s === 12) clap(ctx, out, time);
      const bass = [40, 40, 52, 40, 43, 43, 55, 43][Math.floor(i / 4) % 8];
      if (s % 2 === 1) note(ctx, out, time, hz(bass), len * 0.8, 'sawtooth', 0.035);
    },
  },
  // Refugio: melodía tranquila y algún pajarito.
  fundacion: {
    bpm: 92,
    steps: 32,
    step: (ctx, out, time, i, len) => {
      const melody = [67, -1, 69, 72, -1, 74, 72, -1, 69, -1, 67, -1, 64, -1, 67, -1];
      const m = melody[i % 16];
      if (m > 0) note(ctx, out, time, hz(m), len * 3, 'triangle', 0.055);
      if (i % 8 === 0) note(ctx, out, time, hz(i % 16 === 0 ? 48 : 53), len * 7, 'sine', 0.08);
      if (i % 16 === 11) {
        note(ctx, out, time, 2600, 0.08, 'sine', 0.025);
        note(ctx, out, time + 0.1, 3200, 0.08, 'sine', 0.025);
      }
    },
  },
  // Garaje: groove de rock suave y un golpe de herramienta.
  contacto: {
    bpm: 100,
    steps: 32,
    step: (ctx, out, time, i, len) => {
      const s = i % 16;
      if (s === 0 || s === 6 || s === 10) kick(ctx, out, time);
      if (s === 4 || s === 12) snare(ctx, out, time);
      if (s % 2 === 0) hat(ctx, out, time);
      const riff = [40, -1, 40, 43, -1, 45, -1, 43, 40, -1, 47, -1, 45, 43, -1, -1];
      const r = riff[s];
      if (r > 0) note(ctx, out, time, hz(r), len * 1.5, 'sawtooth', 0.04);
      if (i === 30) note(ctx, out, time, 1850, 0.5, 'triangle', 0.02);
    },
  },
};

let current: { zone: ZoneId; gain: GainNode; timer: number; stopBed?: () => void } | null = null;

/** Cambia al ambiente del lugar indicado, o lo apaga con null. */
export function setAmbience(zone: ZoneId | null) {
  const audio = audioGraph();
  if (!audio || current?.zone === zone) return;
  const { ctx, out } = audio;

  if (current) {
    const old = current;
    old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    window.clearInterval(old.timer);
    window.setTimeout(() => {
      old.stopBed?.();
      old.gain.disconnect();
    }, 2000);
    current = null;
  }
  if (!zone) return;

  const track = tracks[zone];
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(1, ctx.currentTime, 0.6);
  gain.connect(out);
  const stepLength = 60 / track.bpm / 4;
  let index = 0;
  let nextTime = ctx.currentTime + 0.1;
  // Programa las notas con un poco de anticipación para que el ritmo no tiemble.
  const timer = window.setInterval(() => {
    while (nextTime < ctx.currentTime + 0.2) {
      track.step(ctx, gain, nextTime, index, stepLength);
      index = (index + 1) % track.steps;
      nextTime += stepLength;
    }
  }, 50);
  current = { zone, gain, timer, stopBed: track.bed?.(ctx, gain) };
}
