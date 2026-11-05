# Guided demonstrations

The first visit starts with **watch → practice → mathematical recap**. A returning player keeps their selected level and receives a relevant lesson when encountering an unseen mechanic or proof phase. Any lesson can be skipped, paused, restarted or replayed from the Journey menu.

Each lesson uses a small independent example rendered by the same live Three.js engine as the game. Playback waits for the actual action and its animation to finish before continuing. Practice requires the matching state change; text alone cannot complete it. Players may operate the scene directly or use the highlighted action button. Reduced-motion preferences replace autoplay with explicit next-step playback.

The current puzzle remains mounted and paused beneath the lesson. Lesson actions do not spend its energy, change its routes or complete its objectives. Finishing prologue practice records only the prologue and moves into Chapter 1. A separate `math-valley-lessons-v1` record distinguishes completed from skipped lessons without changing chapter progress or locale storage.

The examples cover rotation, spatial portals, bridge construction, edge cuts, complete routes, vertex cuts, directed capacity cuts, residual reachability, flow conservation, reverse residual augmentation, finite covers, ordered loops, the universal cover of a circle, adjacent inverse cancellation, non-contractible closed lifts and bijective sheet pairing. Formal puzzle solutions remain separate.

The teaching strings are in `src/i18n/teaching.js`, with Chinese, English, Japanese and Korean versions. The scene definitions and step predicates are in `src/teaching/lessons.js`; layout and playback live in `TeachingTour.jsx` and `teaching.css`. Mathematical tests verify the examples against the production graph and topology models, including actual projection alignment for the portal example.
