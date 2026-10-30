// Tiny retro sound effects synthesized with the Web Audio API, so there are
// no audio files to load or license.

const MUTE_KEY = 'wishfund:muted';

let ctx: AudioContext | null = null;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    // Storage blocked (private mode); the setting just won't persist.
  }
}

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(ac: AudioContext, freq: number, start: number, duration: number, type: OscillatorType, volume: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

const CLICK_URL = `${import.meta.env.BASE_URL}sounds/click.mp3`;
// The mp3 starts with ~45ms of encoder padding; skip most of it so the click feels instant.
const CLICK_OFFSET = 0.035;

let clickBuffer: AudioBuffer | null = null;
let clickLoading: Promise<void> | null = null;

// Download right away; decoding has to wait for an AudioContext (first click).
const clickBytes: Promise<ArrayBuffer> | null =
  typeof fetch === 'undefined' ? null : fetch(CLICK_URL).then((res) => res.arrayBuffer());
clickBytes?.catch(() => {});

function loadClick(ac: AudioContext): Promise<void> {
  if (!clickBytes) return Promise.resolve();
  clickLoading ??= clickBytes
    .then((data) => ac.decodeAudioData(data))
    .then((buffer) => {
      clickBuffer = buffer;
    })
    .catch(() => {
      // Keep using the synthesized click if the file can't be loaded.
    });
  return clickLoading;
}

/** Real mouse-click sample; falls back to a synthesized tick until it has loaded. */
export function playClick() {
  const ac = audio();
  if (!ac) return;
  if (clickBuffer) {
    const src = ac.createBufferSource();
    src.buffer = clickBuffer;
    src.connect(ac.destination);
    src.start(0, CLICK_OFFSET);
    return;
  }
  void loadClick(ac);
  synthClick(ac);
}

/** Mouse-click "tick" layered with a short 8-bit blip. */
function synthClick(ac: AudioContext) {
  const now = ac.currentTime;

  // Mechanical tick: a few milliseconds of high-passed noise.
  const length = Math.floor(ac.sampleRate * 0.018);
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2500;
  const gain = ac.createGain();
  gain.gain.value = 0.5;
  noise.connect(hp).connect(gain).connect(ac.destination);
  noise.start(now);

  tone(ac, 1320, now, 0.05, 'square', 0.04);
}

/** Coin pickup: two quick rising notes. */
export function playCoin() {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  tone(ac, 988, now, 0.08, 'square', 0.06);
  tone(ac, 1319, now + 0.08, 0.3, 'square', 0.06);
}

/** Level-up arpeggio for buying a wish. */
export function playPowerUp() {
  const ac = audio();
  if (!ac) return;
  const now = ac.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, now + i * 0.07, 0.12, 'square', 0.05));
}
