# Math Valley · 数学漫游

**English** | [中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Math_Valley-47776e?style=flat-square)](https://math-valley.vercel.app/)
[![Build and tests](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml/badge.svg)](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml)
[![Hosted on Vercel](https://img.shields.io/badge/Hosted_on-Vercel-black?style=flat-square&logo=vercel)](https://math-valley.vercel.app/)

**Live URL: [https://math-valley.vercel.app/](https://math-valley.vercel.app/)**

A playable 3D mathematics journey. Rotate miniature architecture, traverse layered galleries, build mathematical objects, and submit evidence for your solution.

![Math Valley prologue gameplay: turn the bridge 90 degrees to connect the stairs, then walk across.](docs/screenshots/rotation-bridge.gif)

[Play online](https://math-valley.vercel.app/) · [Download for Mac or Windows](https://github.com/MartinDelophy/math-valley/releases) · [How the rotation puzzle works (中文)](docs/rotation-bridge.md) · [Report an issue](https://github.com/MartinDelophy/math-valley/issues)

**简体中文 · 繁體中文 · English · 日本語 · 한국어 · Français · Deutsch · Español · Português** — use the gear button on the title screen or **Journey menu → Settings**. Objectives, principle notes, hints, actions, feedback and all four chapters are localized. Switching language preserves the current puzzle state; the chosen language is remembered on this browser origin.

## Desktop app

[Download for macOS and Windows](https://github.com/MartinDelophy/math-valley/releases) — offline packages, the same nine-language game, and persistent local saves. Apple Silicon DMG and ZIP, Windows installer and portable EXE are available through the desktop beta release workflow. The beta is not Apple-notarized or Windows publisher-signed; desktop and browser saves are independent. See [desktop build and release notes](docs/desktop.md).


## What you can play

- **Prologue — Direction & rotation:** an introduction to rotating and walking through the world.
- **Chapter I — Bridges & Connection:** 16 levels on viewpoint passages, constrained spanning trees, disjoint paths, cuts, flow conservation and residual networks.
- **Chapter III — Court of Symmetry:** 8 levels on dihedral groups, noncommutativity, stabilizers, cosets, normality, kernels and quotients. Two galleries connect through viewpoint-aligned mirror gates.
- **Chapter II — Tower of Loops:** 12 levels on winding numbers, inverses, path homotopy, finite covers, universal covers and noncommuting actions. Three architectural families — Moonwell Tower, Twin Courtyards and Unwound Spire — carry distinct puzzles.
- **Chapter IV — Echo Beacons:** 8 levels on parity checks, erasures, syndrome decoding, minimum distance and double-error ambiguity. Repair signals in a layered beacon network.

The journey is for learners with some university mathematics. Observation, construction and proof are part of the game. Notes explain why a move or certificate is valid. Some levels require both travel and an independent proof stage.

![Language picker](docs/screenshots/languages.png)

## Run locally

Requires Node.js 20+ and npm. Use a browser with WebGL support.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open the local URL printed by Vite. To run the production build:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

On macOS, after building, you can also double-click `开始数学漫游.command`. It uses Python 3 to serve `dist/client` on an available loopback port starting at 4180. The runtime needs no account, backend or external content service.

## Controls

First-time visitors begin with a 3D demonstration, then repeat the actions in a small independent practice scene. New mechanics introduce their own examples when first encountered, including proof stages. Lessons can be paused, skipped or replayed through **Journey menu → Guided demonstration**. They support all nine languages and preserve the current puzzle's state and action budget. See [teaching notes](docs/teaching.md).

| Action | Control |
| --- | --- |
| Rotate camera | Drag the scene, or Q / E |
| Zoom | Mouse wheel, or Journey menu |
| Walk / operate | Click a physical platform, gate or mechanism; the journal offers contextual actions |
| Change route direction | Other directions in the journal |
| Undo | Curved arrow beside the compass |
| Principle, hint, chapter select, language | Journal / Journey menu |
| Submit | Journal action or Enter |
| Close notes | Escape |

The 3D title screen offers **Begin journey**, **Continue journey**, and **Past journeys**. Starting a new journey backs up the current one before returning to the prologue lesson. Restore any previous journey from the title screen; gameplay and lessons both provide **Return to title**.

Progress is saved in the browser's IndexedDB. Completed levels, language, teaching records, journal settings and each level's latest completed action are retained. Refreshing or reopening resumes the puzzle, including route drafts, proof stages, camera and undo history. Legacy localStorage saves migrate automatically. Different browsers, devices or site origins have separate saves; clearing site data removes them. See [local save notes](docs/storage.md).

## Deploy

The primary live app is **[math-valley.vercel.app](https://math-valley.vercel.app/)**. The Vercel project is connected to this GitHub repository; pushes to `main` build and deploy production updates.

[`vercel.json`](vercel.json) uses the Vite preset, runs `npm run build`, publishes `dist/client`, and configures the SPA fallback. For a manual deployment:

```sh
npx vercel link --project math-valley
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

### Alternative: Netlify

The existing **[Netlify version](https://math-valley.netlify.app/)** remains available. [`netlify.toml`](netlify.toml) uses the same build command and publish directory.

```sh
npx netlify-cli link --id 0c77e644-ebe8-45b6-98f6-2bc381f63360
npx netlify-cli deploy --prod
```

For both platforms, see [deployment details](docs/deployment.md).

## Development and validation

```sh
npm run build
npm test
```

The checks cover authored puzzle solvability, graph and topology rules, covering permutations, proof constraints, translation completeness and parameter preservation, dialog/HUD rendering across all nine languages, and static packaging. A GitHub Actions workflow runs the build and tests.

- `src/expansion/` — symmetry and coding chapters, independent lessons and replay-validated saves.
- `src/chapter/` — graph-theory chapter and shared Three.js stage.
- `src/topology/` — covering-space levels, pure mathematics and geometry.
- `src/i18n/` — nine-language message catalog, runtime and layout rules.
- `tests/` — mathematical, localization, render and packaging checks.
- `docs/` — screenshots and contributor notes.

See [localization notes](docs/localization.md) for adding a language and [asset credits](docs/assets.md) for the visual assets.

This is a playable prototype. Architectural ornament and difficulty balancing remain open for refinement. The game is independently authored and is not affiliated with Monument Valley or its creators.

The right-hand journal uses Observe/Reasoning tabs and paginated text, with the main action fixed below. Updates preserve progress by stable level ID. Use **Journey save** on the title screen for portable JSON backups; imported saves preserve the current journey as a backup first. See [save compatibility](docs/save-format.md).

The current edition has **44 formal puzzles plus the prologue**, with piano BGM and sound effects only. Guidance uses text and live demonstrations, without TTS. See [new chapter mathematics](docs/chapters-iii-iv.md).

## License

The project source code and code documentation are available under the [MIT License](LICENSE). Game artwork, screenshots, video, audio, fonts, and other media are outside this grant. See the [asset credits](docs/assets.md) and [third-party notices](public/THIRD-PARTY-NOTICES.txt) for applicable terms.
