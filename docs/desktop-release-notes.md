First Math Valley desktop beta: the same 28 mathematical puzzles, four languages, guided 3D demonstrations, and recoverable local journeys, bundled for offline play.

下载 / Downloads:
- **macOS 13+ Apple Silicon (M1/M2/M3/M4 and later):** `mac-arm64.dmg`
- **macOS 13+ Intel:** `mac-x64.dmg`
- **Windows 64-bit installer:** `windows-x64-setup.exe`
- **Windows 64-bit portable:** `windows-x64-portable.exe`
- Mac ZIP archives and `SHA256SUMS.txt` are also included.

首个桌面测试版尚未使用 Apple Developer ID 公证或 Windows 发布者证书。macOS 与 Windows 可能显示未验证发布者提示；这不是已签名的正式发行版。/ This beta is not Apple-notarized or Windows publisher-signed. Operating systems may show an unverified-publisher message. macOS packages use local ad-hoc signing for executable integrity only.

游戏和字体、材质全部随安装包提供。桌面进度保存在此应用自己的 IndexedDB 中，升级沿用存档；与浏览器网站存档相互独立，不自动同步。卸载前请保留应用数据。/ All game assets ship locally. Desktop saves stay in the application's own IndexedDB profile across upgrades and are independent of browser/website saves. There is no automatic cross-device synchronization.

Animated opening included: slow architectural rotation with Pause/Play, a camera push into the cloister, and a dissolve into the saved puzzle. Reduced-motion settings use a brief dissolve instead. Native integration tests verified the saved layer, energy and camera after restarting the app.

Validation: 116 game tests and 3 desktop protocol tests. Packaged macOS ARM64 and Windows x64 pass native integration checks; the macOS Intel executable is tested through Rosetta on Apple Silicon, not on physical Intel hardware.
