# Desktop builds

Math Valley uses a small Electron shell around the same bundled React/Three.js game. All game resources ship in the application, so play needs neither a server nor a Python/Node installation. The four languages, teaching examples, 28 puzzles and local journey backups are shared with the web version. The opening rotates slowly, can be paused, and pushes the camera into the cloister before revealing a resumed game. Reduced-motion settings stop idle rotation and use a brief dissolve.

## Downloads

Get desktop packages from [GitHub Releases](https://github.com/MartinDelophy/math-valley/releases).

| Platform | Package |
| --- | --- |
| Apple Silicon Mac, macOS 13+ | `Math-Valley-<version>-mac-arm64.dmg` |
| Intel Mac, macOS 13+ | `Math-Valley-<version>-mac-x64.dmg` |
| Windows 64-bit | `Math-Valley-<version>-windows-x64-setup.exe` |
| Windows portable | `Math-Valley-<version>-windows-x64-portable.exe` |

Mac ZIP archives and a SHA-256 checksum manifest are also provided. The first beta has **no Apple Developer ID notarization or Windows publisher certificate**. Mac bundles are ad-hoc signed for executable integrity; this does not make them trusted notarized releases. OS first-launch/download warnings are possible. A signed public distribution needs the appropriate signing credentials in the release pipeline.

## Saves

The standard, secure `math-valley://app` origin enables IndexedDB and absolute asset URLs. It stays unchanged between releases. Data lives in the `Math Valley` application profile under the OS application-data directory; upgrading retains it. Windows uninstall keeps app data. The portable executable uses the same user profile as the installer rather than writing personal progress beside the executable.

Desktop and website origins have independent saves. They do not automatically synchronize or import each other. There is no account, telemetry, cloud-save service or automatic updater in this beta.

The renderer has no Node.js integration, uses context isolation and sandboxing, and has no preload/IPC bridge. Navigation and resources stay within the bundle; external help links are static allowlisted menu items opened in the system browser. Content Security Policy is delivered by the protocol response. Camera, microphone and other permission requests are denied because the game needs none.

## Development

```sh
npm ci
npm run desktop:install
npm run desktop:start
```

Desktop dependencies have their own lockfile in `desktop/`; web builds do not install Electron. `desktop:start` first builds the game and opens that local production build. It does not embed the hosted Vercel URL.

```sh
npm run build
npm run test:desktop
node scripts/smoke-desktop.mjs
npm --prefix desktop run pack
```

Build distributables on the respective operating system:

```sh
npm run desktop:mac
npm run desktop:win
```

On macOS, pass `--arm64` or `--x64` directly to the desktop builder when selecting an architecture. Outputs are under `release/`, ignored by Git. Native libraries are not exposed to the renderer.

## Release workflow

`Desktop release` in GitHub Actions builds on macOS ARM64, macOS Intel and Windows x64. Each native runner smoke-tests its packaged executable: bundled origin, WebGL frame, asset loading, language changes, first teaching entry, and IndexedDB persistence across separate app processes, plus saved layer/energy/camera restoration and reduced-motion entry. Renderer errors and failed resource requests fail the job. GPU-less Intel Mac CI runners opt into the bundled SwiftShader WebGL fallback and reduced motion only in isolated diagnostic mode with trusted bundled content; normal application launches keep the system graphics backend. Only after every platform passes can a draft prerelease be assembled, with SHA-256 hashes.

A `v<desktop/package.json version>` tag triggers this workflow. It can also run manually; choose **Create a draft** to assemble a draft with the matching version tag after validation. The tag is created at the exact workflow commit and never moved. Existing published releases are never overwritten. Publishing a draft is a separate final step.

To make a new version, update `desktop/package.json` and its lockfile, commit, and run the workflow. The desktop semver is independent of the web package's private development version. Keep app ID, product name, profile directory and scheme stable to retain local saves. Future signing/notarization can be added to the native jobs without changing the game renderer or its data format.
