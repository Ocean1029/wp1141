# 📚 TripTimeline Maps 文檔索引

本目錄包含 TripTimeline Maps 專案的完整技術文檔與使用指南。

---

## 🎯 開始之前

### 第一次使用本專案？

**請依序閱讀：**

1. **[QUICKSTART.md](./QUICKSTART.md)** ⭐
   - 5 分鐘快速開始指南
   - Google Maps API 金鑰申請步驟
   - 環境變數配置
   - 常見問題排解

2. **[FEATURES.md](./FEATURES.md)**
   - 完整功能說明
   - 使用範例與操作流程
   - 資料不變式說明

---

## 📖 文檔清單

### 使用指南

| 文檔 | 說明 | 適合對象 |
|------|------|---------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 快速開始指南，包含 API 金鑰申請與環境設置 | 所有人 |
| **[FEATURES.md](./FEATURES.md)** | 完整功能說明與使用範例 | 使用者、評分者 |

### 技術文檔

| 文檔 | 說明 | 適合對象 |
|------|------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | 系統架構、技術選型、設計決策 | 開發者 |
| **[API_EXAMPLES.md](./API_EXAMPLES.md)** | API 使用範例（10+ curl 命令） | 開發者、評分者 |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 生產環境部署指南 | DevOps |

### 開發參考

| 文檔 | 說明 | 適合對象 |
|------|------|---------|
| **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** | 測試案例與流程 | QA、開發者 |

---

## 🚀 快速連結

### 主要端點

- **前端應用**：http://localhost:5173
- **後端 API**：http://localhost:3000
- **API 文檔**：http://localhost:3000/api-docs
- **健康檢查**：http://localhost:3000/health

### 開發指令

```bash
# 啟動服務
make dev

# 查看日誌
make logs

# 填充測試資料
make seed

# 清理重啟
make clean && make dev
```

### 測試帳號

```
Email: demo@example.com
Password: Demo1234
```

---

## 📋 文檔內容概覽

### QUICKSTART.md

**內容包含：**
- Google Maps API 申請步驟
- 環境變數配置
- Docker 啟動流程
- 驗證安裝步驟
- 常見問題解答

**適合：** 第一次使用本專案的任何人

---

### FEATURES.md

**內容包含：**
- 認證系統詳細說明
- 標籤系統使用範例
- 地點管理流程
- 事件管理與時間軸
- Google Maps 整合
- 使用者介面說明
- 資料流動與不變式

**適合：** 需要深入了解功能的使用者與評分者

---

### ARCHITECTURE.md

**內容包含：**
- 後端架構（分層設計、模組結構）
- 前端架構（組件設計、狀態管理）
- 認證流程（JWT 機制）
- 資料不變式設計
- 錯誤處理
- Google Maps 整合
- 安全性設計

**適合：** 開發者、技術評審

---

### API_EXAMPLES.md

**內容包含：**
- 認證流程範例
- Tag CRUD 操作
- Place CRUD 操作
- Event CRUD 操作
- Maps 服務使用範例
- 完整測試劇本
- 錯誤處理範例

**適合：** 需要測試 API 的開發者與評分者

---

### DEPLOYMENT.md

**內容包含：**
- 生產環境準備
- 環境變數設定
- Docker Compose 配置
- Nginx 反向代理
- SSL 憑證設置
- 監控與維護
- 效能優化

**適合：** DevOps、系統管理員

---

### TESTING_GUIDE.md

**內容包含：**
- 測試案例（TC-001 到 TC-011）
- 手動測試流程
- API 測試範例
- 不變式測試
- 權限驗證測試
- 安全性測試清單

**適合：** QA、測試工程師

---

## 🔍 如何找到資訊

### 想要...

**快速開始？**
→ 閱讀 [QUICKSTART.md](./QUICKSTART.md)

**了解功能？**
→ 閱讀 [FEATURES.md](./FEATURES.md)

**測試 API？**
→ 閱讀 [API_EXAMPLES.md](./API_EXAMPLES.md)

**深入技術？**
→ 閱讀 [ARCHITECTURE.md](./ARCHITECTURE.md)

**部署到生產？**
→ 閱讀 [DEPLOYMENT.md](./DEPLOYMENT.md)

**執行測試？**
→ 閱讀 [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## 📦 專案結構

```
hw4/
├── README.md                    # 專案主入口
├── CHANGELOG.md                 # 版本歷史
├── LICENSE                      # MIT 授權
├── Makefile                     # 開發指令
├── docker-compose.yml           # Docker 配置
├── docs/                        # 📚 文檔目錄（本目錄）
│   ├── README.md               # 文檔索引（本檔案）
│   ├── QUICKSTART.md           # 快速開始
│   ├── FEATURES.md             # 功能說明
│   ├── ARCHITECTURE.md         # 技術架構
│   ├── API_EXAMPLES.md         # API 範例
│   ├── DEPLOYMENT.md           # 部署指南
│   └── TESTING_GUIDE.md        # 測試指南
├── backend/                     # 後端服務
│   ├── src/
│   └── prisma/
└── frontend/                    # 前端應用
    └── src/
```

---

## 💡 建議閱讀順序

### 評分者/審核者

1. [QUICKSTART.md](./QUICKSTART.md) - 快速開始
2. [FEATURES.md](./FEATURES.md) - 了解功能
3. [API_EXAMPLES.md](./API_EXAMPLES.md) - 測試 API

### 開發者

1. [QUICKSTART.md](./QUICKSTART.md) - 啟動專案
2. [FEATURES.md](./FEATURES.md) - 了解功能
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - 深入了解技術
4. [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 執行測試

### DevOps

1. [QUICKSTART.md](./QUICKSTART.md) - 了解基本配置
2. [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - 了解系統架構

---

## 🆘 需要協助？

### 常見問題

1. **地圖無法顯示** → 查看 [QUICKSTART.md](./QUICKSTART.md) 的「常見問題」
2. **API 回傳 401** → 檢查登入狀態與 Cookie 設定
3. **容器無法啟動** → 執行 `make clean && make build`

### 獲取更多資訊

- API 文檔：http://localhost:3000/api-docs
- 健康檢查：http://localhost:3000/health
- 專案根目錄：`../README.md`

---

**最後更新：** 2025-10-26

