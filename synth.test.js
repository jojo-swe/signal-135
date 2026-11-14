// Self-check for synth.js: run with `npm test` (plain node, no test framework).
const assert = require('node:assert');
const S = require('./synth.js');

assert.strictEqual(S.DUR, 180, '3-minute demo');
const bar = (b) => b * S.BAR;

// whole track: finite, never clips past [-1, 1]
let peak = 0;
for (let t = 0; t < S.DUR; t += 1 / 4000) {
  for (const v of S.sample(t)) { assert.ok(Number.isFinite(v), `NaN at ${t}`); peak = Math.max(peak, Math.abs(v)); }
}
assert.ok(peak <= 1 && peak > 0.3, `peak ${peak}`);

// silent edges (fade in/out)
assert.deepStrictEqual(S.sample(0).map(Math.abs), [0, 0]);
assert.ok(Math.abs(S.sample(S.DUR)[0]) < 1e-9);

// arrangement: kick drives the visuals' K uniform too
const kickOn = (b) => S.kickEnv(bar(b) + 0.001) > 0.5;
assert.ok(!kickOn(2), 'no kick in intro');
assert.ok(kickOn(10) && kickOn(60) && kickOn(80), 'kick in main sections');
assert.ok(!kickOn(44), 'no kick in breakdown');
assert.ok(!kickOn(92), 'no kick in outro');

// drops are louder than the breakdown
const rms = (b0, b1) => { let s = 0, n = 0; for (let t = bar(b0); t < bar(b1); t += 1 / 4000, n++) s += S.sample(t)[0] ** 2; return Math.sqrt(s / n); };
assert.ok(rms(32, 40) > rms(40, 48) * 1.5, 'gyroid drop louder than breakdown');
assert.ok(rms(72, 88) > rms(88, 96), 'reprise louder than outro');

console.log('synth ok, peak', peak.toFixed(3));
