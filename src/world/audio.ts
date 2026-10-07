
/**
 * Sonidos generados con Web Audio: no hay archivos que descargar y
 * todo suena con el mismo estilo de juego.
 */
let context: AudioContext | null = null;
let master: GainNode | null = null;

const STORAGE_KEY = 'mundo-jhon-sonido';
/** Volumen general: suave para acompañar sin molestar. */
const MASTER_VOLUME = 0.45;

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    return false;
  }
}

let muted = readMuted();
const listeners = new Set<() => void>();

export const sound = {
  isMuted: () => muted,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setMuted(value: boolean) {
    muted = value;
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'off' : 'on');
    } catch {
      // Sin almacenamiento: la preferencia solo dura esta visita.
    }
    if (master && context) master.gain.setTargetAtTime(value ? 0 : MASTER_VOLUME, context.currentTime, 0.05);
    listeners.forEach((listener) => listener());
  },
};

/** Debe llamarse desde un clic o una tecla: los navegadores bloquean el audio antes de eso. */
export function unlockAudio() {
  if (!context) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context = new Ctor();
    master = context.createGain();
    master.gain.value = muted ? 0 : MASTER_VOLUME;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume();
}

function ready() {
  return context && master && !muted ? { ctx: context, out: master } : null;
}

function tone(
  ctx: AudioContext,
  out: AudioNode,
  { type = 'sine', from, to = from, start = 0, duration, volume = 0.3 }: { type?: OscillatorType; from: number; to?: number; start?: number; duration: number; volume?: number },
) {
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + duration);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function noise(
  ctx: AudioContext,
  out: AudioNode,
  { start = 0, duration, volume = 0.3, filter = 'bandpass', frequency = 1000, q = 1, attack = 0.02 }: { start?: number; duration: number; volume?: number; filter?: BiquadFilterType; frequency?: number; q?: number; attack?: number },
) {
  const t = ctx.currentTime + start;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const biquad = ctx.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.value = frequency;
  biquad.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(volume, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(biquad).connect(gain).connect(out);
  source.start(t);
}

/** Ladrido corto: ráfaga con formante que cae de tono. */
function bark(ctx: AudioContext, out: AudioNode, start: number, pitch = 1) {
  tone(ctx, out, { type: 'sawtooth', from: 520 * pitch, to: 260 * pitch, start, duration: 0.14, volume: 0.18 });
  noise(ctx, out, { start, duration: 0.12, volume: 0.25, frequency: 900 * pitch, q: 3, attack: 0.005 });
}

/** Campanita de logro desbloqueado. */
export function playAchievement() {
  const audio = ready();
  if (!audio) return;
  [988, 1319].forEach((f, i) => tone(audio.ctx, audio.out, { type: 'triangle', from: f, start: 0.6 + i * 0.1, duration: 0.35, volume: 0.15 }));
}

/** Tyson saluda. */
export function playBark() {
  const audio = ready();
  if (!audio) return;
  bark(audio.ctx, audio.out, 0, 0.9);
  bark(audio.ctx, audio.out, 0.2, 0.9);
}

/** Sonido "Press Start". */
export function playStart() {
  const audio = ready();
  if (!audio) return;
  [392, 523, 659, 784].forEach((f, i) => tone(audio.ctx, audio.out, { type: 'square', from: f, start: i * 0.07, duration: 0.15, volume: 0.1 }));
}

type Engine = {
  oscillators: OscillatorNode[];
  pulse: OscillatorNode;
  pulseDepth: GainNode;
  rumble: AudioBufferSourceNode;
  rumbleFilter: BiquadFilterNode;
  rumbleGain: GainNode;
  filter: BiquadFilterNode;
  gain: GainNode;
};

function softClip(amount: number) {
  const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

/**
 * Motor de moto de alto cilindraje: tono grave de dos cilindros, golpes de
 * explosión (modulación de amplitud), leve distorsión y retumbe del escape.
 */
function createEngine(ctx: AudioContext, out: AudioNode): Engine {
  const body = ctx.createGain();
  body.gain.value = 0.6;

  const oscillators = [
    { type: 'sawtooth' as OscillatorType, detune: 0, level: 0.5 },
    { type: 'sawtooth' as OscillatorType, detune: -1200, level: 0.45 },
    { type: 'square' as OscillatorType, detune: 700, level: 0.08 },
  ].map(({ type, detune, level }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    gain.gain.value = level;
    osc.connect(gain).connect(body);
    osc.start();
    return osc;
  });

  // Golpes de explosión: una onda cuadrada que abre y cierra el volumen.
  const pulse = ctx.createOscillator();
  const pulseDepth = ctx.createGain();
  pulse.type = 'square';
  pulseDepth.gain.value = 0.4;
  pulse.connect(pulseDepth).connect(body.gain);
  pulse.start();

  // Retumbe grave del escape.
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const rumble = ctx.createBufferSource();
  rumble.buffer = buffer;
  rumble.loop = true;
  const rumbleFilter = ctx.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.value = 160;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.25;
  rumble.connect(rumbleFilter).connect(rumbleGain).connect(body);
  rumble.start();

  const shaper = ctx.createWaveShaper();
  shaper.curve = softClip(1.6);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1.8;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  body.connect(shaper).connect(filter).connect(gain).connect(out);

  return { oscillators, pulse, pulseDepth, rumble, rumbleFilter, rumbleGain, filter, gain };
}

let engine: Engine | null = null;

/** Velocidad máxima de cada marcha (unidades del mundo por segundo). */
const GEAR_TOPS = [3.5, 6.5, 9.5, 12.5, 16, 21];
let currentGear = 0;
/** Mientras dure, el motor "corta" como al soltar el acelerador para meter el cambio. */
let shiftUntil = 0;

function gearFor(speed: number) {
  const index = GEAR_TOPS.findIndex((top) => speed < top);
  return index === -1 ? GEAR_TOPS.length - 1 : index;
}

/**
 * Sonido del motor según la velocidad de la moto. Cada marcha sube de
 * revoluciones y, al pasar a la siguiente, el tono cae como en un cambio real.
 */
export function updateEngine(speed: number) {
  if (!context || !master) return;
  engine ??= createEngine(context, master);
  const t = context.currentTime;
  const absSpeed = Math.abs(speed);

  const gear = gearFor(absSpeed);
  if (gear !== currentGear) {
    if (gear > currentGear) shiftUntil = t + 0.14;
    currentGear = gear;
  }
  const bottom = gear === 0 ? 0 : GEAR_TOPS[gear - 1];
  const progress = Math.min((absSpeed - bottom) / (GEAR_TOPS[gear] - bottom), 1);
  // Las primeras marchas arrancan más abajo; las altas se mantienen más arriba.
  const low = gear === 0 ? 0 : 0.35 + gear * 0.04;
  const rpm = absSpeed < 0.3 ? 0 : low + (1 - low) * progress;
  const shifting = t < shiftUntil;

  const frequency = 30 + rpm * 62 + gear * 3;
  const lag = shifting ? 0.06 : 0.09;
  engine.oscillators.forEach((osc) => osc.frequency.setTargetAtTime(frequency, t, lag));
  engine.pulse.frequency.setTargetAtTime(frequency / 2, t, lag);
  engine.pulseDepth.gain.setTargetAtTime(0.45 - rpm * 0.15, t, 0.2);
  engine.filter.frequency.setTargetAtTime(220 + rpm * 520 + gear * 25, t, 0.12);
  engine.rumbleFilter.frequency.setTargetAtTime(110 + rpm * 120, t, 0.15);
  const volume = shifting ? 0.018 : 0.03 + rpm * 0.035;
  engine.gain.gain.setTargetAtTime(volume, t, shifting ? 0.03 : 0.12);
}

export function stopEngine() {
  if (engine && context) engine.gain.gain.setTargetAtTime(0, context.currentTime, 0.15);
}

/** Silencia todo de inmediato y pausa el audio (por ejemplo al salir del mundo 3D). */
export function suspendAudio() {
  stopEngine();
  if (context && context.state === 'running') void context.suspend();
}

/** Contexto y salida general, si el audio ya se activó. */
export function audioGraph() {
  return context && master ? { ctx: context, out: master } : null;
}
