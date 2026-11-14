# HANDOVER.md

Överlämning mellan agenter och sessioner. Läs innan du börjar, uppdatera innan du slutar.

## Aktuellt läge

*Senast inventerat 2026-11-14 av Claude Code.*

Projekt: A 60-second realtime demo. One HTML page, one synth file, zero libraries.

- Huvudbranch: `main`
- Senaste commit på `main`: 2026-11-04 `6630d48` Merge pull request #2 (AGENTS.md + HANDOVER.md)
- Öppna PR:er: endast denna städ-PR (`agent/claude/handover-cleanup`)
- Andra brancher på remote: inga (gamla `cursor/privacy-guard-dbfd` raderad, innehållet fanns redan i main via #1)
- CI (`privacy-guard`) grönt. Demot är funktionellt färdigt; inga TODO:s i koden.

## Pågående arbete

| Agent/vem | Branch | Status | Beskrivning |
|-----------|--------|--------|-------------|
| Claude Code | `agent/claude/handover-cleanup` | PR öppen | Uppdaterar HANDOVER.md efter branch-städning |

## Nästa steg

Förslag (inget beslutat):

- Slå på GitHub Pages så demot går att länka live.
- Rendera MP4 med `render.js` och lägg upp som release.
- Vidareutveckla demot (fler scener, längre spår, övergångar).

## Kända problem

- `npm test` är npm:s platshållare och felar alltid; inga tester finns.
- Demot och `render.js` ej körda/verifierade sedan 2026-10-28.

## Senaste commits

- 2026-11-04 `6630d48` Merge pull request #2 (AGENTS.md + HANDOVER.md)
- 2026-11-01 `89195fc` Add privacy guard checks for private data (#1)
- 2026-10-28 `9f36227` Ignore local site build folder
- 2026-10-28 `cda5eac` SIGNAL 135: realtime WebGL demo with procedural synth

## Logg

| Datum | Agent | Vad som gjordes |
|-------|-------|-----------------|
| 2026-11-04 | Claude (Cowork) | Lade till AGENTS.md, HANDOVER.md och CLAUDE.md; inventerade PR:er, brancher och commits. |
| 2026-11-14 | Claude Code | Statusgenomgång; raderade inaktuell remote-branch `cursor/privacy-guard-dbfd` (med användarens OK); uppdaterade HANDOVER.md. |
