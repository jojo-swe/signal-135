# HANDOVER.md

Överlämning mellan agenter och sessioner. Läs innan du börjar, uppdatera innan du slutar.

## Aktuellt läge

*Senast inventerat 2026-11-14 av Claude Code.*

Projekt: A 3-minute realtime demo (60 s på `main` tills PR för 3-minutersversionen är mergad). One HTML page, one synth file, zero libraries.

- Huvudbranch: `main`
- Senaste commit på `main`: 2026-11-14 `c3baf39` Merge pull request #3 (HANDOVER-städning)
- Öppna PR:er: #4 gyroid-fixen (`agent/claude/sharpen-gyroid`), 3-minutersversionen (`agent/claude/three-minutes`, bygger på #4)
- CI (`privacy-guard`) grönt.
- Demot kört och verifierat i webbläsaren 2026-11-14 (alla fyra scener, inga konsolfel, ~1,5–2,5 ms/bildruta i 720p).
- Lokal körning: `python -m http.server 8135` och öppna `http://127.0.0.1:8135`. Exakta bildrutor: `?render` + `window.renderFrame(t, w, h)` i konsolen.

## Pågående arbete

| Agent/vem | Branch | Status | Beskrivning |
|-----------|--------|--------|-------------|
| Claude Code | `agent/claude/sharpen-gyroid` | PR #4 öppen | Fixar urblekt/dimmig gyroid-scen |
| Claude Code | `agent/claude/three-minutes` | PR öppen (bas: #4) | Förlänger demot till 3 min (12 sektioner à 15 s, repris i nya färger) och gör om musiken till mörk industrial techno; strömmande ljud; `npm test` |

## Nästa steg

Önskemål från användaren (2026-11-14):

- **Publicera demot på johnjohansson.com** när 3-minutersversionen är mergad. Hur sajten hostas är inte undersökt ännu.

Övriga förslag:

- Rendera MP4 med `render.js` och lägg upp som release.
- `preview.png` visar fortfarande gamla gyroid-utseendet om den bilden är från 30–45 s.

## Kända problem

- Ljudet strömmas i 2 s-bitar strax före uppspelningen (synten är ~19x realtid i Node). En mycket långsam enhet (<1x) skulle få hack; ej testat på mobil.
- Lyssna-fil: `node`-export till `out/signal-135-industrial.wav` (gitignorerad, skapas lokalt).
- Realtidsuppspelningen av 3-minutersversionen är bara kontrollerad bildruta för bildruta (`?render`), inte tittad på i sin helhet med ljud.
- Ljudet ej avlyssnat/verifierat av agent (kan inte höra).
- `render.js` (offline-MP4) ej körd sedan 2026-10-28.

## Senaste commits

- 2026-11-14 `c3baf39` Merge pull request #3 (HANDOVER-städning)
- 2026-11-04 `6630d48` Merge pull request #2 (AGENTS.md + HANDOVER.md)
- 2026-11-01 `89195fc` Add privacy guard checks for private data (#1)
- 2026-10-28 `9f36227` Ignore local site build folder
- 2026-10-28 `cda5eac` SIGNAL 135: realtime WebGL demo with procedural synth

## Logg

| Datum | Agent | Vad som gjordes |
|-------|-------|-----------------|
| 2026-11-04 | Claude (Cowork) | Lade till AGENTS.md, HANDOVER.md och CLAUDE.md; inventerade PR:er, brancher och commits. |
| 2026-11-14 | Claude Code | Statusgenomgång; raderade inaktuell remote-branch `cursor/privacy-guard-dbfd` (med användarens OK); uppdaterade HANDOVER.md (PR #3). |
| 2026-11-14 | Claude Code | Musiken omgjord till dark industrial techno på användarens önskan (harmonisk moll, distad kick, rullande bas, acid, metallslag, risers). Snabbare additiv synt (sinusrekursion) och strömmande uppspelning i stället för förberäkning. |
| 2026-11-14 | Claude Code | Förlängde demot till 3 minuter (PR på `agent/claude/three-minutes`); lade till `synth.test.js` som `npm test`; procentvisning vid ljudberäkning. |
| 2026-11-14 | Claude Code | Körde demot i webbläsaren. Fixade gyroid-scenen: tunnelurgröpningen hade fel tecken (gyroiden fanns bara i kamerans rör) + dämpad distans mot randiga artefakter. |
