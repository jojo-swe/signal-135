// Offline renderer: headless Chromium draws each frame at an exact time, ffmpeg muxes with the synth's WAV.
// usage: node render.js [width] [height] [fps] [startSec] [endSec] [out]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const Synth = require('./synth.js');
const [W = 1280, H = 720, FPS = 30, S0 = 0, S1 = Synth.DUR] = process.argv.slice(2, 7).map(Number);
const OUT = process.argv[7] || 'out/signal-135.mp4';
fs.mkdirSync(path.dirname(OUT), { recursive: true });

function writeWav(file) {
  const N = Math.floor(Synth.DUR * Synth.SR), buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(Synth.SR, 24); buf.writeUInt32LE(Synth.SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { const [l, r] = Synth.sample(i / Synth.SR);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r)) * 32767), 46 + i * 4); }
  fs.writeFileSync(file, buf);
}

(async () => {
  const wav = OUT.replace(/\.mp4$/, '.wav');
  if (!fs.existsSync(wav)) { console.time('wav'); writeWav(wav); console.timeEnd('wav'); }
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 640, height: 360 } });
  p.on('pageerror', e => { console.error('PAGE', e.message); process.exit(1); });
  await p.goto('file://' + path.resolve('index.html') + '?render');
  await p.waitForFunction('window.ready === true');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-ss', String(S0), '-t', String(S1 - S0), '-i', wav,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(S0 * FPS), n1 = Math.round(S1 * FPS), t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    const url = await p.evaluate(([t, w, h]) => window.renderFrame(t, w, h), [n / FPS, W, H]);
    const ok = ff.stdin.write(Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
    if (!ok) await new Promise(r => ff.stdin.once('drain', r));
    if (n % 30 === 0) console.log(`frame ${n}/${n1}  ${((Date.now() - t0) / 1000 / (n - n0 + 1)).toFixed(2)} s/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
  console.log('done', OUT);
})();
