// SIGNAL 135 — stateless procedural synth.
// sample(t) is a pure function of time: no buffers, no state, no samples.
// The same code runs in the browser (live) and in Node (offline WAV for the video).
(function (root) {
  const SR = 44100, BPM = 128, SPB = 60 / BPM, BAR = SPB * 4, DUR = 180;
  const TAU = Math.PI * 2;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // one chord per bar. A: Am - F - C - G. B (breakdown + Menger act): F - G - Em - Am
  const A = { CH: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], BASS: [33, 29, 36, 31],
    LEAD: [[76, 72], [77, 72], [76, 79], [74, 71]] };
  const B = { CH: [[53, 57, 60], [55, 59, 62], [52, 55, 59], [57, 60, 64]], BASS: [29, 31, 28, 33],
    LEAD: [[77, 72], [79, 74], [76, 79], [76, 72]] };

  function hash(n) {
    n = (n << 13) ^ n;
    n = (Math.imul(n, Math.imul(Math.imul(n, n), 15731) + 789221) + 1376312589) & 0x7fffffff;
    return n / 1073741823.5 - 1;
  }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // section envelopes (bars)
  const bar = (t) => t / BAR;
  const on = (t, spans) => { const b = bar(t); return spans.some(([a, z]) => b >= a && b < z); };
  const prog = (t) => (bar(t) >= 40 && bar(t) < 64 ? B : A);

  // arrangement in bars (1 bar = 1.875 s, 96 bars = 180 s), see README timeline
  const KICK = [[4, 40], [48, 88]], HATS = [[2, 40], [44, 90]], BASS_ON = [[12, 40], [48, 88]];
  const ARP = [[20, 95]], DROP = [[32, 40], [56, 64], [72, 88]], BREAK = [[40, 48]];

  function kickEnv(t) {
    if (!on(t, KICK)) return 0;
    const tb = t % SPB;
    return Math.exp(-tb * 6);
  }

  function kick(t) {
    if (!on(t, KICK)) return 0;
    const tb = t % SPB;
    const ph = TAU * (48 * tb + (130 / 22) * (1 - Math.exp(-22 * tb)));
    return Math.sin(ph) * Math.exp(-tb * 6.5) + 0.25 * Math.exp(-tb * 300);
  }

  function hats(t, n) {
    if (!on(t, HATS)) return 0;
    const e8 = SPB / 2, tb = t % e8;
    const off = Math.floor(t / e8) % 2 === 1 ? 1 : 0.35;
    const hp = (hash(n) - hash(n - 1)) * 0.5;
    const intro = bar(t) < 4 ? 0.5 : 1;
    return hp * Math.exp(-tb * 45) * off * intro;
  }

  function clap(t, n) {
    if (!on(t, DROP)) return 0;
    const beat = Math.floor(t / SPB) % 4;
    if (beat !== 1 && beat !== 3) return 0;
    const tb = t % SPB;
    const bp = hash(n) - hash(n - 3);
    return bp * (Math.exp(-tb * 18) + 0.5 * Math.exp(-Math.abs(tb - 0.012) * 200));
  }

  function chordAt(t) { return Math.floor(bar(t)) % 4; }

  function bass(t) {
    if (!on(t, BASS_ON)) return 0;
    const f = mtof(prog(t).BASS[chordAt(t)]);
    const e16 = SPB / 4, tb = t % e16;
    let s = 0;
    for (let k = 1; k <= 8; k++) s += Math.sin(TAU * k * f * t) / k * Math.exp(-k * 0.28);
    const duck = 1 - 0.85 * kickEnv(t);
    return s * (0.35 + 0.65 * Math.exp(-tb * 9)) * duck;
  }

  function pad(t, ch) {
    const tb = t % BAR;
    const env = Math.min(1, tb / 0.25) * Math.min(1, (BAR - tb) / 0.08);
    let l = 0, r = 0;
    for (const m of prog(t).CH[chordAt(t)]) {
      const f = mtof(m);
      for (const o of [1, 2]) {
        l += Math.sin(TAU * f * o * 0.997 * t) / o;
        r += Math.sin(TAU * f * o * 1.003 * t) / o;
      }
    }
    return ch ? r * env : l * env;
  }

  function arpRaw(t) {
    if (t < 0 || !on(t, ARP)) return 0;
    const e16 = SPB / 4, i = Math.floor(t / e16), tb = t % e16;
    const c = prog(t).CH[chordAt(t)];
    const seq = [0, 1, 2, 3, 4, 5, 4, 2];
    const k = seq[i % 8];
    const m = c[k % 3] + 12 * (1 + Math.floor(k / 3));
    const f = mtof(m);
    let s = 0;
    for (let h = 1; h <= 7; h += 2) s += Math.sin(TAU * h * f * t) / h;
    return s * Math.exp(-tb * 14);
  }

  function lead(t) {
    if (!on(t, DROP)) return 0;
    const half = BAR / 2, idx = Math.floor(t / half) % 2, tb = t % half;
    const m = prog(t).LEAD[chordAt(t)][idx];
    const vib = 1 + 0.004 * Math.sin(TAU * 5.5 * t) * sstep(0.2, 0.5, tb);
    const f = mtof(m) * vib;
    let s = 0;
    for (let k = 1; k <= 6; k++) s += Math.sin(TAU * k * f * t) / (k * k * 0.6 + 0.4);
    return s * Math.min(1, tb / 0.03) * Math.exp(-tb * 1.2);
  }

  // returns [left, right]
  function sample(t) {
    const n = Math.floor(t * SR);
    const k = kick(t) * 0.9;
    const hh = hats(t, n) * 0.22;
    const cl = clap(t, n) * 0.25;
    const b = bass(t) * 0.42;
    const padAmt = 0.045 * (on(t, DROP) ? 0.7 : on(t, BREAK) ? 1.4 : 1);
    const a0 = arpRaw(t), a1 = arpRaw(t - SPB * 0.75), a2 = arpRaw(t - SPB * 1.5);
    const arpA = 1 - sstep(88, 95, bar(t)) * 0.8;
    const ld = lead(t) * 0.12;
    let L = k + hh + cl + b + pad(t, 0) * padAmt + (a0 * 0.10 + a1 * 0.06 + a2 * 0.015) * arpA + ld;
    let R = k + hh + cl + b + pad(t, 1) * padAmt + (a0 * 0.10 + a1 * 0.015 + a2 * 0.05) * arpA + ld;
    const fade = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, DUR - t) / 3);
    return [Math.tanh(L * 1.1) * fade, Math.tanh(R * 1.1) * fade];
  }

  const api = { SR, BPM, SPB, BAR, DUR, sample, kickEnv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Synth = api;
})(this);
