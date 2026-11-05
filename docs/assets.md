# Visual assets and dependencies

- Architecture, travelers and mechanisms are real Three.js geometry authored for this project.
- The paper frames, action plates, compass, diagram and limestone texture under `public/assets/` were generated for this prototype with image generation, then integrated as visual assets.
- The repository and website sharing cover at `public/social-preview.jpg` was created with built-in ImageGen from a gameplay capture and exported as a 1280×640 JPEG. Its final prompt is recorded in [social-preview-prompt.txt](social-preview-prompt.txt).
- The opening ivory/gold button and plum floor are built-in ImageGen assets. The floor is a repeatable albedo map on a real Three.js plane; the architecture remains live 3D. Asset prompts are in [opening-assets](opening-assets/).
- The subset Noto Serif SC fonts are distributed with their font license at `public/assets/FONT-LICENSE.txt`.
- Interface icons use `@phosphor-icons/react`. React, Three.js, Vite and other packages retain their respective dependency licenses.
- The miniature architecture is inspired by spatial puzzle games. This project does not include assets from Monument Valley and is not affiliated with its creators.

- The desktop icon in `desktop/build/` was generated with built-in ImageGen using the actual game screenshot as a style reference. PNG, ICNS and ICO export the same image. Prompt: [desktop-icon-prompt.txt](desktop-icon-prompt.txt).

## Classical piano

- `public/audio/bach-prelude-bwv846.mp3` — J. S. Bach, Prelude No. 1 in C major BWV 846, piano by Kimiko Ishizaka (2015), Open Well-Tempered Clavier. Complete CC0 recording, transcoded from the original Ogg to MP3 with FFmpeg. Source and CC0 terms: `public/audio/LICENSE.txt`. Bundled locally for web and desktop playback.

## Paginated notebook

- `public/assets/hud/rotation-study.png` — transparent ivory bridge rotation study, generated with the built-in Image Gen tool from the selected second notebook concept. Engineering resize to 768×512, preserving alpha. Prompt: `docs/notebook-rotation-prompt.txt`.
- The existing folded-paper frame, paper texture, action plate and Phosphor icons are reused. All editable copy, formulas, tabs and pagination remain semantic UI.
