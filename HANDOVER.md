# HANDOVER.md

Överlämning mellan agenter och sessioner. Läs innan du börjar, uppdatera innan du slutar.

## Aktuellt läge

*Senast inventerat 2026-11-14 av Claude Code.*

Projekt: A 60-second realtime demo. One HTML page, one synth file, zero libraries.

- Huvudbranch: `main`
- Senaste commit på `main`: 2026-11-14 `c3baf39` Merge pull request #3 (HANDOVER-städning)
- Öppna PR:er: gyroid-fixen (`agent/claude/sharpen-gyroid`)
- CI (`privacy-guard`) grönt.
- Demot kört och verifierat i webbläsaren 2026-11-14 (alla fyra scener, inga konsolfel, ~1,5–2,5 ms/bildruta i 720p).
- Lokal körning: `python -m http.server 8135` och öppna `http://127.0.0.1:8135`. Exakta bildrutor: `?render` + `window.renderFrame(t, w, h)` i konsolen.

## Pågående arbete

| Agent/vem | Branch | Status | Beskrivning |
|-----------|--------|--------|-------------|
| Claude Code | `agent/claude/sharpen-gyroid` | PR öppen | Fixar urblekt/dimmig gyroid-scen (30–45 s) |

## Nästa steg

Önskemål från användaren (2026-11-14), inte påbörjade:

- **Göra demot betydligt längre.** Längd och upplägg ej bestämt. Berör `synth.js` (`DUR`, arrangemang), scenindelningen i shadern (`floor(T/15.)`, fyra scener à 15 s), text-`CUES` och fade-tiderna (57,5/60 s) i `index.html`.
- **Publicera demot på johnjohansson.com.** Hur sajten hostas är inte undersökt ännu.

Övriga förslag:

- Rendera MP4 med `render.js` och lägg upp som release.
- `preview.png` visar fortfarande gamla gyroid-utseendet om den bilden är från 30–45 s.

## Kända problem

- `npm test` är npm:s platshållare och felar alltid; inga tester finns.
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
| 2026-11-14 | Claude Code | Körde demot i webbläsaren. Fixade gyroid-scenen: tunnelurgröpningen hade fel tecken (gyroiden fanns bara i kamerans rör) + dämpad distans mot randiga artefakter. |
