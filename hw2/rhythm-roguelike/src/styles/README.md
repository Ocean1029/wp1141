# 樣式架構說明

## 📁 架構原則

這個專案採用**組件驅動的樣式架構**，讓樣式與組件更緊密綁定。

## 🗂️ 目錄結構

```
src/
├── styles/                 # 只包含基礎樣式
│   ├── base.css            # 全域基礎樣式 (CSS reset, 字體等)
│   ├── layout.css          # 通用佈局樣式
│   └── index.css           # 主入口，匯入基礎樣式
│
├── components/             # 組件及其樣式
│   └── ui/
│       ├── Button.tsx
│       ├── Button.css      # 按鈕組件專用樣式
│       ├── LoadingScreen.tsx
│       └── LoadingScreen.css
│
└── scenes/                 # 場景組件及其樣式
    ├── StartScreen.tsx
    ├── StartScreen.css     # 開始畫面專用樣式
    ├── GameScreen.tsx
    ├── GameScreen.css      # 遊戲畫面專用樣式 (包含節奏條等)
    ├── PauseScreen.tsx
    ├── PauseScreen.css
    ├── GameOverScreen.tsx
    └── GameOverScreen.css
```

## ✅ 優點

1. **組件獨立性**: 每個組件都包含自己的樣式，可以獨立移動和重用
2. **樣式局部化**: 減少全域樣式污染，降低樣式衝突
3. **維護性**: 修改組件時，相關樣式就在旁邊，容易維護
4. **可讀性**: 清楚知道每個樣式屬於哪個組件
5. **測試友好**: 組件和樣式打包在一起，更容易進行單元測試

## 📋 規則

- `src/styles/` 只放置基礎樣式和通用佈局
- 組件特定的樣式必須放在組件旁邊
- 樣式檔案命名與組件檔案相同
- 避免跨組件的樣式依賴

## 🚫 不再使用

以下檔案已被組件樣式取代：
- ~~buttons.css~~ → `components/ui/Button.css`
- ~~rhythm.css~~ → `scenes/GameScreen.css`  
- ~~game.css~~ → 分散到各遊戲組件
- ~~start-screen.css~~ → `scenes/StartScreen.css`
- ~~animations.css~~ → 分散到各組件
