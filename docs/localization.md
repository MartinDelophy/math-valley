# Localization

The four locale identifiers are `zh-CN`, `en`, `ja` and `ko`. Chinese remains the canonical content language. `src/i18n/messages.js` contains rows in that order, with one row per source message. Every language includes both chapters, mathematical notes, goals, hints, accessible labels and runtime feedback.

`translate()` in `core.js` resolves whole source strings, then parameterized messages such as `见证点尚未按序齐备：{0} / {1}。`. Dynamic values and formulas stay intact. Nested feedback is resolved at render time. Headings composed from a Roman numeral and a catalog name use the longest registered phrases in a single pass. New runtime messages should have explicit source templates in the catalog, rather than relying on phrase fallback.

`useLocale()` subscribes the React tree to locale changes. `setLocale()` updates the document language and the separate `math-valley-locale` preference. It does not recreate the game engine or mutate puzzle data. The existing `math-roam-chapter-v3` progress key and all level IDs remain unchanged.

To add a language, extend `LANGUAGES`, the catalog columns, the locale mapping and appropriate font/layout fallbacks. Preserve every `{0}`, `{1}`, etc. in translations. Use concise action labels and preserve mathematical distinctions: based path homotopy, edge- versus vertex-disjoint paths, a closed lift versus a contractible loop, and monodromy versus deck transformations.

Run `npm run build && npm test`, then check the actual menu, level objectives, principle/hint/success pages and proof controls at desktop and phone widths. The render suite exercises every level dialog and HUD phase in all four languages. Japanese and Korean use system serif fallbacks; exact glyph appearance can vary across operating systems.
