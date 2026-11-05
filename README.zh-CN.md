# Math Valley · 数学漫游

[English](README.md) | **中文** | [日本語](README.ja.md) | [한국어](README.ko.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Math_Valley-47776e?style=flat-square)](https://math-valley.vercel.app/)
[![Build and tests](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml/badge.svg)](https://github.com/MartinDelophy/math-valley/actions/workflows/checks.yml)
[![Hosted on Vercel](https://img.shields.io/badge/Hosted_on-Vercel-black?style=flat-square&logo=vercel)](https://math-valley.vercel.app/)

**在线地址: [https://math-valley.vercel.app/](https://math-valley.vercel.app/)**

通过立体空间解谜学习数学的本地网页游戏。旋转视角、探索多层建筑、操作机关，再用数学构造和证明完成关卡。

支持 **简体中文、英文、日文、韩文**。在开场页，或左上角「旅途菜单 → 语言」切换；当前层数、路径、印记和行动余量会保留，语言偏好自动保存。

![四语言切换](docs/screenshots/languages.png)

- **序章**：方向与旋转。
- **第一章「桥与连通」**：16 关，包含视角穿越、带约束的生成树、不交路径、割、流与残量网络。
- **第二章「回环之塔」**：12 关，使用月井环塔、双井叠庭、螺旋高塔三种场景，探索绕数、逆路径、同伦、有限覆盖、万有覆盖与非交换作用。

面向已有大学数学基础的学习者。原理手记、观察提示和独立证明均融入关卡；部分关卡需要同时完成行走与证据验证。

## 运行

准备 Node.js 20+、npm 和支持 WebGL 的浏览器。

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

访问终端显示的网址。生产版本：

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

macOS 在构建后也可以双击 `开始数学漫游.command`，通过 Python 3 启动本地版本。Q / E 切换视角，拖动画面旋转，滚轮缩放；点击实体场景或手札执行操作，罗盘旁的箭头可撤回。左上菜单提供章节、原理、提示和语言。

3D 开场提供「开始旅程」「继续旅程」和「往昔旅程」。开始新旅程会先备份当前进度，再进入序章教学；旧旅程可以随时恢复。游戏和教学中都可以「回到开场」。

数据保存在浏览器的 IndexedDB 中，包括通关、教学记录、语言、手札设置，以及每关最近完成一步后的解题状态。刷新或重新打开后可继续路线、流量和证明阶段，也保留视角与撤销历史。旧 localStorage 存档会自动迁移。不同浏览器、设备或网站域名分别存档，清理站点数据会清除本机记录。详见 [本机存档说明](docs/storage.md)。

首次进入会先看到真实 3D 教学，再在独立小场景中亲手验证。新机制及证明阶段首次出现时，也有对应示例。教学支持四种语言，可暂停、跳过，并从「旅途菜单 → 教学演示」重看；不改变正在解题的状态，也不消耗正式关卡行动。

```sh
npm run build
npm test
```

目前为可玩原型，美术细节和难度仍可迭代。更多开发信息见 [English README](README.md)。

## 部署

正式入口：[https://math-valley.vercel.app/](https://math-valley.vercel.app/)。Vercel 已连接本 GitHub 仓库，推送到 `main` 会自动构建并部署。

项目提供 [vercel.json](vercel.json)，构建命令为 `npm run build`，发布目录为 `dist/client`。手动部署：

```sh
npx vercel link --project math-valley
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

### Netlify 备用版本

[https://math-valley.netlify.app/](https://math-valley.netlify.app/) 继续保留。对应配置是 [netlify.toml](netlify.toml)，同样发布 `dist/client`。

详细维护流程见 [部署说明](docs/deployment.md)。
