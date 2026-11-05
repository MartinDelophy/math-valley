Math Valley 0.2 desktop beta: 44 mathematical puzzles, nine languages, guided 3D demonstrations, and recoverable local journeys, bundled for offline play.

下载 / Downloads:
- **macOS 13+ Apple Silicon (M1/M2/M3/M4 and later):** `mac-arm64.dmg`
- **Windows 64-bit installer:** `windows-x64-setup.exe`
- **Windows 64-bit portable:** `windows-x64-portable.exe`
- A Mac ZIP archive and `SHA256SUMS.txt` are also included.

首个桌面测试版尚未使用 Apple Developer ID 公证或 Windows 发布者证书。macOS 与 Windows 可能显示未验证发布者提示；这不是已签名的正式发行版。/ This beta is not Apple-notarized or Windows publisher-signed. Operating systems may show an unverified-publisher message. macOS packages use local ad-hoc signing for executable integrity only.

游戏和字体、材质全部随安装包提供。桌面进度保存在此应用自己的 IndexedDB 中，升级沿用存档；与浏览器网站存档相互独立，不自动同步。卸载前请保留应用数据。/ All game assets ship locally. Desktop saves stay in the application's own IndexedDB profile across upgrades and are independent of browser/website saves. There is no automatic cross-device synchronization.

Animated opening included: slow architectural rotation with Pause/Play, a camera push into the cloister, and a dissolve into the saved puzzle. Reduced-motion settings use a brief dissolve instead. Native integration tests verified the saved layer, energy and camera after restarting the app.

Validation: 166 game tests and 3 desktop protocol tests. Packaged macOS ARM64 and Windows x64 pass native integration checks; Intel Mac builds are not included in this first release: hosted Intel runners lack a usable graphics device and the Rosetta integration run did not complete. They need separate hardware validation before publication.

Language & sound settings: 简体中文, 繁體中文, English, 日本語, 한국어, Français, Deutsch, Español, Português. A gear menu controls language, piano BGM, volume, sound effects and opening motion. Long translated labels fit their button plates. Music is the complete CC0 Bach BWV 846 recording performed by Kimiko Ishizaka. Guidance uses text and teaching demonstrations without TTS. New European translations are an initial machine-assisted edition with terminology corrections.

The right-hand journal follows the selected paginated design: Observe/Reasoning tabs, complete text across pages, fixed primary action and mathematical notes, with no native scrollbars.

Update-safe saves: stable level IDs retain completed puzzles and exact checkpoints as new levels arrive. New content is marked separately. Portable JSON export/import works across website and desktop profiles; import archives the current journey first.

New playable chapters:
- **Court of Symmetry / 对称之庭:** 8 levels on dihedral operations, noncommutativity, stabilizers, cosets, normality, kernels and quotient groups. A two-storey courtyard includes real viewpoint-aligned mirror passages.
- **Echo Beacons / 回声信标:** 8 levels on parity equations, erasures, syndrome decoding, minimum distance, extended Hamming codes and two-error ambiguity certificates. Rotating the scene reveals parity channels.
- Two independent teaching demonstrations, full nine-language notes, checkpoints with replay validation, and sixteen appended stable level IDs. The previous 28 puzzles keep their progress.
- **No TTS, narration or device voice controls.** Only sound effects and the bundled classical piano BGM remain.

The new finite group rules and code distances are checked independently. Native UI playthroughs cover all sixteen additions on macOS; both release platforms also run the quotient and ambiguity puzzles inside the packaged application.
