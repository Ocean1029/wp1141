# Rhythm Roguelike

一個結合節拍遊戲和 Roguelike 元素的網頁遊戲，使用 React + TypeScript + Vite 開發。

## 專案結構

```
src/
├── components/          # React 組件
│   ├── Game.tsx        # 主要遊戲組件
│   └── index.ts        # 組件匯出
├── hooks/              # 自定義 React Hooks
│   ├── useGameState.ts # 遊戲狀態管理 Hook
│   └── index.ts        # Hooks 匯出
├── systems/            # 遊戲系統
│   ├── RhythmSystem.ts # 節拍系統
│   └── index.ts        # 系統匯出
├── pages/              # 頁面組件
│   ├── HomePage.tsx    # 主頁面
│   └── index.ts        # 頁面匯出
├── assets/             # 靜態資源
├── main.tsx           # 應用程式入口點
└── style.css          # 全域樣式
```

## 技術棧

- **React 18** - 前端框架
- **TypeScript** - 型別安全
- **Vite** - 建置工具
- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化

## 開發指令

```bash
# 安裝依賴項目
npm install

# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 程式碼檢查
npm run lint

# 自動修復 ESLint 錯誤
npm run lint:fix

# 格式化程式碼
npm run format

# 檢查程式碼格式
npm run format:check
```

## 遊戲特色

- 🎵 節拍遊戲機制
- 🎲 Roguelike 隨機元素
- 🎮 響應式設計
- 🌙 深色/淺色主題支援
- ⚡ 高效能 React 架構

## 遊戲規格

詳細的遊戲設計規格請參考 [docs/spec.md](./docs/spec.md)

### 核心特色
- 🎵 **節拍系統**: 120 BPM, 4/4 拍，正負拍音效
- ⚔️ **戰鬥系統**: 反拍攻擊，四種敵人 AI
- 🗺️ **地牢系統**: 三層隨機生成地牢
- 🎁 **獎勵機制**: 房間獎勵 + 層級獎勵
- 🎨 **2.5D 像素風**: 現代像素藝術風格

## 開發計劃

### Phase 1 (v1.0)
- [x] 專案架構建立
- [ ] 基本節拍系統 (120 BPM, 4/4 拍)
- [ ] 玩家移動和攻擊系統
- [ ] 四種敵人 AI 實現
- [ ] 基本地圖系統 (8×8, 6×6, 4×6)
- [ ] 三層地牢結構
- [ ] 獎勵機制
- [ ] 勝利/失敗畫面

### Phase 2 (未來擴展)
- [ ] 多職業系統
- [ ] 更多敵人類型
- [ ] Boss 戰
- [ ] 技能系統 (衝刺等)
- [ ] 更複雜的地圖生成
- [ ] 音效和背景音樂優化

## 授權

MIT License
