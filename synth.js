// SIGNAL 135 — stateless procedural synth. Dark industrial techno.
// sample(t) is a pure function of time: no buffers, no state, no samples.
// The same code runs in the browser (live) and in Node (offline WAV for the video).
(function (root) {
  const SR = 44100, BPM = 128, SPB = 60 / BPM, BAR = SPB * 4, DUR = 180, E16 = SPB / 4;
  const TAU = Math.PI * 2;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // one chord per bar, harmonic minor for the E-major bite.
  // A: Am - Am - F - E. B (breakdown + Menger act): F - Dm - Bb - E
  const A = { CH: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [52, 56, 59]], BASS: [33, 33, 29, 28],
    LEAD: [[69, 72], [76, 72], [72, 69], [71, 68]] };
  const B = { CH: [[53, 57, 60], [50, 53, 57], [46, 50, 53], [52, 56, 59]], BASS: [29, 38, 34, 28],
    LEAD: [[72, 69], [74, 69], [74, 70], [71, 68]] };

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
  const chordAt = (t) => Math.floor(bar(t)) % 4;

  // arrangement in bars (1 bar = 1.875 s, 96 bars = 180 s), see README timeline
  const KICK = [[4, 40], [48, 88]], HATS = [[2, 40], [44, 90]], BASS_ON = [[12, 40], [48, 88]];
  const ARP = [[20, 95]], DROP = [[32, 40], [56, 64], [72, 88]], BREAK = [[40, 48]];
  const CLANK_ON = [[20, 40], [56, 88]], RISE = [[30, 32], [54, 56], [70, 72]], HITS = [32, 56, 72];

  // stateless "filter": additive saw whose partials are weighted by a lowpass curve,
  // plus an optional resonant bump at the cutoff (acid squelch). Partials far above fc are skipped.
  // sin(k*ph) comes from the recurrence sin(k ph) = 2cos(ph) sin((k-1) ph) - sin((k-2) ph): two trig calls per voice
  function saw(f, t, fc, res, maxK) {
    const ph = TAU * ((f * t) % 1), c2 = 2 * Math.cos(ph);
    let sk = Math.sin(ph), sp = 0, s = 0;
    for (let k = 1; k <= maxK; k++) {
      const x = k * f;
      if (x > fc * 2.5 || x > 16000) break; // lowpass is already ~-30 dB here
      const r = x / fc, lp = 1 / (1 + r * r * r * r);
      const pk = res && Math.abs(r - 1) < 0.5 ? res * Math.exp(-(r - 1) * (r - 1) * 40) : 0;
      s += sk * (lp + pk) / k;
      const nx = c2 * sk - sp; sp = sk; sk = nx;
    }
    return s;
  }

  function kickEnv(t) {
    if (!on(t, KICK)) return 0;
    return Math.exp(-(t % SPB) * 6);
  }

  // distorted kick with a hard pitch drop and a noise click
  function kick(t, n) {
    if (!on(t, KICK)) return 0;
    const tb = t % SPB;
    const ph = TAU * (44 * tb + (170 / 30) * (1 - Math.exp(-30 * tb)));
    return Math.tanh(Math.sin(ph) * Math.exp(-tb * 5) * 2.4) * 0.85 + 0.3 * hash(n) * Math.exp(-tb * 250);
  }

  // rolling 16th bass on the three steps the kick leaves free
  function bass(t) {
    if (!on(t, BASS_ON)) return 0;
    if (Math.floor((t % SPB) / E16) === 0) return 0;
    const tb = t % E16, f = mtof(prog(t).BASS[chordAt(t)]);
    const fc = 160 + 650 * (0.5 + 0.5 * Math.sin(TAU * t / (BAR * 8))) + (on(t, DROP) ? 350 : 0);
    return Math.tanh(saw(f, t, fc, 0, 14) * 2) * Math.min(1, tb / 0.004) * Math.exp(-tb * 16);
  }

  // closed 16ths plus an open hat on the offbeat
  function hats(t, n) {
    if (!on(t, HATS)) return 0;
    const hp = (hash(n) - hash(n - 1)) * 0.5;
    const tb = t % E16, step = Math.floor(t / E16) % 4;
    const closed = step === 2 ? 0 : Math.exp(-tb * 60) * (step % 2 ? 0.8 : 0.35);
    const open = step === 2 ? Math.exp(-tb * 9) * 1.1 : 0;
    return hp * (closed + open) * (bar(t) < 4 ? 0.5 : 1);
  }

  // industrial snare: noise, a metallic body and a stateless dotted-8th echo
  function snareRaw(t, n) {
    if (t < 0) return 0;
    const beat = Math.floor(t / SPB) % 4;
    if (beat !== 1 && beat !== 3) return 0;
    const tb = t % SPB;
    const nz = hash(n) - hash(n - 2);
    return nz * (Math.exp(-tb * 14) + 0.6 * Math.exp(-Math.abs(tb - 0.011) * 220)) + 0.6 * Math.sin(TAU * 185 * tb) * Math.exp(-tb * 30);
  }
  function snare(t, n) {
    if (!on(t, DROP)) return 0;
    const d = Math.round(SPB * 0.75 * SR);
    return snareRaw(t, n) + 0.35 * snareRaw(t - SPB * 0.75, n - d) + 0.12 * snareRaw(t - SPB * 1.5, n - 2 * d);
  }

  // FM metal hits on a syncopated 16th pattern
  const CLANK = [0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1];
  function clank(t) {
    if (!on(t, CLANK_ON)) return 0;
    const i = Math.floor(t / E16);
    if (!CLANK[i % 16]) return 0;
    const tb = t % E16, f = 380 + 60 * (i % 3);
    return Math.sin(TAU * f * tb + 4 * Math.exp(-tb * 25) * Math.sin(TAU * f * 1.414 * tb)) * Math.exp(-tb * 22);
  }

  // dark detuned saw drone, an octave down, slowly breathing filter
  function pad(t, ch) {
    const fc = 500 + 350 * Math.sin(TAU * t / (BAR * 16)), det = ch ? 1.004 : 0.996;
    let s = 0;
    for (const m of prog(t).CH[chordAt(t)]) s += saw(mtof(m - 12) * det, t, fc, 0, 7);
    const tb = t % BAR;
    return s * Math.min(1, tb / 0.25) * Math.min(1, (BAR - tb) / 0.08);
  }

  // 303-style acid line: resonant sweep, accents on the offbeat 16th
  const SEQ = [0, 0, 3, 0, 1, 0, 4, 2, 0, 0, 3, 1, 5, 0, 2, 4];
  function acidRaw(t) {
    if (t < 0 || !on(t, ARP)) return 0;
    const i = Math.floor(t / E16), tb = t % E16;
    const c = prog(t).CH[chordAt(t)], k = SEQ[i % 16];
    const m = c[k % 3] - 12 + 12 * Math.floor(k / 3);
    const acc = i % 4 === 2 ? 1 : 0.55;
    const fc = 300 + 2200 * (0.5 + 0.5 * Math.sin(TAU * t / (BAR * 4))) * (0.4 + 0.6 * Math.exp(-tb * 10)) * acc;
    return Math.tanh(saw(mtof(m), t, fc, 2.5, 18) * 1.5) * Math.exp(-tb * 9) * acc;
  }

  // detuned, driven saw lead in the drops
  function lead(t) {
    if (!on(t, DROP)) return 0;
    const half = BAR / 2, idx = Math.floor(t / half) % 2, tb = t % half;
    const vib = 1 + 0.005 * Math.sin(TAU * 5.5 * t) * sstep(0.2, 0.5, tb);
    const f = mtof(prog(t).LEAD[chordAt(t)][idx]) * vib;
    return Math.tanh((saw(f, t, 2600, 0, 10) + saw(f * 1.006, t, 2600, 0, 10)) * 1.4) * Math.min(1, tb / 0.02) * Math.exp(-tb * 1.6);
  }

  // noise + pitch riser into each drop, then a sub/noise impact on the downbeat
  function fx(t, n) {
    let s = 0;
    for (const [a, z] of RISE) {
      const t0 = a * BAR, L = (z - a) * BAR, dt = t - t0;
      if (dt < 0 || dt >= L) continue;
      const x = dt / L;
      s += ((hash(n) - hash(n - 1)) * 0.8 + 0.3 * Math.sin(TAU * (200 * dt + 1600 * dt * dt / (2 * L)))) * x * x;
    }
    for (const b of HITS) {
      const dt = t - b * BAR;
      if (dt >= 0 && dt < 3) s += 0.5 * hash(n) * Math.exp(-dt * 1.8) + Math.sin(TAU * 38 * dt) * Math.exp(-dt * 2.5);
    }
    return s;
  }

  // returns [left, right]
  function sample(t) {
    const n = Math.floor(t * SR);
    const duck = 1 - 0.8 * kickEnv(t);
    const k = kick(t, n) * 0.95;
    const hh = hats(t, n) * 0.2;
    const sn = snare(t, n) * 0.45;
    const cl = clank(t) * 0.15;
    const b = bass(t) * 0.6;
    const padAmt = 0.03 * (on(t, DROP) ? 0.7 : on(t, BREAK) ? 3 : 1) * duck;
    const a0 = acidRaw(t), a1 = acidRaw(t - SPB * 0.75);
    const arpA = (1 - sstep(88, 95, bar(t)) * 0.8) * 0.2 * duck;
    const ld = lead(t) * 0.15 * duck;
    const f = fx(t, n) * 0.2;
    const mid = k + hh + sn + b + ld + f;
    const L = mid + pad(t, 0) * padAmt + (a0 + a1 * 0.25) * arpA + cl * 0.8;
    const R = mid + pad(t, 1) * padAmt + (a0 + a1 * 0.45) * arpA + cl * 1.2;
    const fade = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, DUR - t) / 3);
    return [Math.tanh(L * 1.15) * fade, Math.tanh(R * 1.15) * fade];
  }

  const api = { SR, BPM, SPB, BAR, DUR, sample, kickEnv };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Synth = api;
})(this);
