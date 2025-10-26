# 🗺️ TripTimeline Maps

> Map-first trip planning application with timeline scheduling

TripTimeline Maps 是一個以地圖為主的行程規劃應用，整合 Google Maps、標籤系統和時間軸功能，讓使用者在單一介面完成「找地點、貼標籤、排時間」的完整流程。

## ⚠️ 重要安全提醒

**本專案需要 Google Maps API 金鑰才能運行，請務必：**

1. **不要提交真實的 API 金鑰到版本控制系統**
2. **設置 API 金鑰限制**：
   - 瀏覽器金鑰（frontend）：限制網域為 `http://localhost:5173/*` 和 `http://127.0.0.1:5173/*`
   - 伺服器金鑰（backend）：本地開發可無 IP 限制
3. **評分者需自行申請並替換金鑰**
4. 獲取金鑰：https://console.cloud.google.com/apis/credentials

**所需啟用的 Google APIs：**
- Maps JavaScript API（前端）
- Geocoding API（後端）
- Places API（後端）

---

## 🚀 快速開始

### 前置需求

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Google Maps API Key](https://console.cloud.google.com/apis/credentials)

### 步驟一：設置環境變數

**後端（`backend/.env`）：**
```bash
cp backend/.env.example backend/.env
# 編輯並填入你的 Google Maps API 伺服器金鑰
```

**前端（`frontend/.env`）：**
```bash
cp frontend/.env.example frontend/.env
# 編輯並填入你的 Google Maps API 瀏覽器金鑰
```

### 步驟二：啟動服務

```bash
make dev
```

或使用 Docker Compose：
```bash
docker compose up
```

### 步驟三：訪問應用

- 前端：http://localhost:5173
- 後端 API：http://localhost:3000
- API 文檔：http://localhost:3000/api-docs
- 測試帳號：
  - Email: demo@example.com
  - Password: Demo1234

---

## 📖 文件導覽

### 首次使用
- **[docs/QUICKSTART.md](./docs/QUICKSTART.md)** - 詳細的快速開始指南，包含 Google Maps API 申請步驟
- **[docs/FEATURES.md](./docs/FEATURES.md)** - 完整功能說明與使用方式

### 技術文檔
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - 技術架構與設計決策
- **[docs/API_EXAMPLES.md](./docs/API_EXAMPLES.md)** - API 使用範例與 curl 命令
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - 生產環境部署指南

### 開發參考
- **[docs/TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)** - 測試案例與流程
- **Makefile** - 常用開發指令
- **docker-compose.yml** - Docker 服務配置

---

## 🏗️ 技術棧

**前端**
- React 18 + TypeScript
- Vite
- React Router
- FullCalendar (TimeGrid)
- Google Maps JavaScript API

**後端**
- Node.js 20 + TypeScript
- Express 4
- Prisma 5 (ORM)
- PostgreSQL 15
- JWT (HTTP-only Cookies)
- Zod 驗證

---

## 🔑 核心功能

1. **地圖互動** - Google Maps 點擊建立地點、標記顯示、篩選
2. **標籤系統** - 多標籤組織地點、Tag-based 篩選
3. **時間軸** - FullCalendar TimeGrid 日程安排、拖曳調整
4. **認證授權** - JWT + Refresh Token、自動刷新
5. **資料不變式** - Place 必須至少有 1 個 Tag

---

## 🛠️ 開發指令

| 指令 | 說明 |
|------|------|
| `make dev` | 啟動所有服務 |
| `make stop` | 停止所有服務 |
| `make build` | 重新建置容器 |
| `make logs` | 查看服務日誌 |
| `make seed` | 填充測試資料 |
| `make shell-backend` | 進入後端容器 |
| `make db` | 開啟 PostgreSQL CLI |

---

## 📚 完整文檔

詳細的使用指南、API 文檔與技術說明都在 `docs/` 目錄：

```
docs/
├── QUICKSTART.md      - 詳細快速開始指南
├── FEATURES.md        - 功能說明與使用範例
├── ARCHITECTURE.md    - 技術架構與設計決策
├── API_EXAMPLES.md    - API 使用範例（10+ curl）
├── DEPLOYMENT.md      - 生產部署指南
└── TESTING_GUIDE.md   - 測試案例與流程
```

---

## 🐛 疑難排解

遇到問題？查看 **[docs/QUICKSTART.md](./docs/QUICKSTART.md)** 的「常見問題」章節。

---

## 📄 授權

MIT License

---

**需要協助？** 查看 `docs/` 目錄中的詳細文檔。
