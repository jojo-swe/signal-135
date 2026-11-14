# HANDOVER.md

Överlämning mellan agenter och sessioner. Läs innan du börjar, uppdatera innan du slutar.

## Aktuellt läge

*Senast inventerat 2026-11-14 av Claude Code.*

Projekt: A 3-minute realtime demo with dark industrial techno. One HTML page, one synth file, zero libraries.

- Huvudbranch: `main`
- `main` innehåller gyroid-fixen (#4), 3-minuters-/industrial-versionen (#5), HANDOVER-not (#6) och a11y-fixen (#7: PLAY/REPLAY som knappar, `prefers-reduced-motion` = stillbild per sektion), alla mergade 2026-11-14.
- Projektet är pausat 2026-11-14 på användarens begäran.
- Öppna PR:er: inga. Andra brancher på remote: inga.
- CI (`privacy-guard`) grönt.
- Demot verifierat i webbläsaren 2026-11-14: alla 12 sektioner via `?render`, inga konsolfel, ~1,5–2,5 ms/bildruta i 720p, strömmande ljud startar <1 s.
- Lokal körning: `python -m http.server 8135` och öppna `http://127.0.0.1:8135`. Exakta bildrutor: `?render` + `window.renderFrame(t, w, h)` i konsolen.

## Pågående arbete

| Agent/vem | Branch | Status | Beskrivning |
|-----------|--------|--------|-------------|
| – | – | – | Inget pågående arbete |

## Nästa steg

Önskemål från användaren (2026-11-14):

- **Gå live på johnjohansson.com:** demot ligger på sajt-repots `main` (`/signal-135/`, jojo-swe/johnjohansson-com#2 och #3). John låter en Grok-bot köra Build + `release.yml` i sajt-repot (prompt given 2026-11-14); VPS:en installerar sedan inom ~15 min. Kontrollera att https://johnjohansson.com/signal-135/ svarar 200 och att `/build.txt` visar den nya `site-r`-taggen. Ändras demot här måste `index.html` och `synth.js` kopieras till `public/signal-135/` igen.

Övriga förslag:

- Rendera MP4 med `render.js` och lägg upp som release.
- `preview.png` visar fortfarande gamla gyroid-utseendet om den bilden är från 30–45 s.

## Kända problem

- Ljudet strömmas i 2 s-bitar strax före uppspelningen (synten är ~19x realtid i Node). En mycket långsam enhet (<1x) skulle få hack; ej testat på mobil.
- Lyssna-fil: `node`-export till `out/signal-135-industrial.wav` (gitignorerad, skapas lokalt).
- Realtidsuppspelningen av 3-minutersversionen är bara kontrollerad bildruta för bildruta (`?render`), inte tittad på i sin helhet med ljud.
- Ljudet ej avlyssnat/verifierat av agent (kan inte höra).
- `render.js` (offline-MP4) ej körd sedan 2026-10-28. WAV-cachen byggs nu om när `synth.js` ändrats.

## Senaste commits

- 2026-11-14 Merge PR #7: PLAY/REPLAY som knappar, reducerad rörelse
- 2026-11-14 Merge PR #6: HANDOVER pekar på webbplats-PR:en
- 2026-11-14 Merge PR #5: 3 minuter, industrial techno, strömmande ljud, `npm test`, render-cachefix
- 2026-11-14 Merge PR #4: gyroid-scenen skarp
- 2026-11-14 `c3baf39` Merge PR #3 (HANDOVER-städning)
- 2026-10-28 `cda5eac` SIGNAL 135: realtime WebGL demo with procedural synth

## Logg

| Datum | Agent | Vad som gjordes |
|-------|-------|-----------------|
| 2026-11-04 | Claude (Cowork) | Lade till AGENTS.md, HANDOVER.md och CLAUDE.md; inventerade PR:er, brancher och commits. |
| 2026-11-14 | Claude Code | Statusgenomgång; raderade inaktuell remote-branch `cursor/privacy-guard-dbfd` (med användarens OK); uppdaterade HANDOVER.md (PR #3). |
| 2026-11-14 | Claude Code | Mergade #6, raderade mergade brancher (bara `main` kvar), gav John en deploy-prompt för Grok-bot. Paus. |
| 2026-11-14 | Claude Code | PLAY/REPLAY som knappar och prefers-reduced-motion (stillbild per sektion), #7. Kopierat till sajten. |
| 2026-11-14 | Claude Code | Öppnade jojo-swe/johnjohansson-com#2 som publicerar demot på `/signal-135/`. |
| 2026-11-14 | Claude Code | Rättade render.js WAV-cache (Devin Review). Mergade #4 och #5 på användarens begäran. |
| 2026-11-14 | Claude Code | Musiken omgjord till dark industrial techno på användarens önskan (harmonisk moll, distad kick, rullande bas, acid, metallslag, risers). Snabbare additiv synt (sinusrekursion) och strömmande uppspelning i stället för förberäkning. |
| 2026-11-14 | Claude Code | Förlängde demot till 3 minuter (PR på `agent/claude/three-minutes`); lade till `synth.test.js` som `npm test`; procentvisning vid ljudberäkning. |
| 2026-11-14 | Claude Code | Körde demot i webbläsaren. Fixade gyroid-scenen: tunnelurgröpningen hade fel tecken (gyroiden fanns bara i kamerans rör) + dämpad distans mot randiga artefakter. |
