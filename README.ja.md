# Math Valley

[English](README.md) | [中文](README.zh-CN.md) | **日本語** | [한국어](README.ko.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Math_Valley-47776e?style=flat-square)](https://math-valley.vercel.app/)
[![Build and tests](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml/badge.svg)](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml)
[![Hosted on Vercel](https://img.shields.io/badge/Hosted_on-Vercel-black?style=flat-square&logo=vercel)](https://math-valley.vercel.app/)

**公開URL: [https://math-valley.vercel.app/](https://math-valley.vercel.app/)**

立体建築を回し、層を歩き、数学の構成と証明で進むパズルゲームです。簡体字・繁体字中国語、英語、日本語、韓国語、フランス語、ドイツ語、スペイン語、ポルトガル語に対応しています。「旅のメニュー → 設定」で切り替えても、プレイ中の状態は保たれます。

![Math Valley](docs/screenshots/gameplay-en.png)

序章に加え、第1章「橋と連結」は16ステージ、第2章「回環の塔」は12ステージ。全域木、非交差経路、フローからホモトピー・被覆空間まで扱います。大学数学の基礎を持つ学習者を想定しています。

[macOS / Windows デスクトップ版をダウンロード](https://github.com/MartinDelophy/math-valley/releases)。オフラインで全9言語・ローカルセーブに対応。Apple Silicon Mac は DMG・ZIP、Windows はインストーラー・ポータブル EXE。初回ベータは Apple 公証・Windows 発行元署名がありません。ウェブとは別のセーブです。[詳細](docs/desktop.md)。

Node.js 20+ とnpmを用意し、プロジェクト直下で実行してください。

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

3D タイトル画面から新しい旅を始めたり、前回の続きを遊べます。新しい旅の開始時は現在の進行をバックアップし、序章のレッスンから出発します。「これまでの旅」から復元でき、ゲームとレッスンの両方に「タイトルに戻る」があります。言語もタイトル画面で切り替えられます。

表示されたローカルURLをWebGL対応ブラウザーで開きます。Q / Eまたはドラッグで視点を回し、場面や手帳の操作を選びます。IndexedDB にクリア記録・言語・レッスン・手帳設定と各問題の進行を保存し、再読み込み後も直近の完了した操作から再開できます。経路・証明段階・視点・取り消し履歴も復元します。旧 localStorage の記録は自動移行します。別の端末やオリジンとは同期せず、サイトデータを消すと記録も消えます。

初回は実際の3D実演を見てから、独立した小さな場面で自分で操作します。新しい仕掛けや証明段階にも対応する例があり、4言語で一時停止・スキップ・再生が可能です。「旅のメニュー → 操作レッスン」から見直せます。本編の状態や行動数には影響しません。

現在はプレイ可能な試作版です。[開発・検証方法](README.md)

公開版は [Vercel](https://math-valley.vercel.app/) です。GitHubの `main` へのプッシュで更新されます。[Netlify版](https://math-valley.netlify.app/)も利用できます。[公開手順](docs/deployment.md)

第3章「対称の庭」8ステージと第4章「反響の信標」8ステージを追加し、第5章「余りの時計塔」の4ステージを含め、正式ステージは計48。群作用・剰余類と、誤り訂正・シンドロームを空間機構で学びます。音声合成は使わず、ピアノBGMと効果音、文章と実演で案内します。
