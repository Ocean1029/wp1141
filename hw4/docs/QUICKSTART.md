# 🚀 TripTimeline Maps - 快速開始指南

## 5 分鐘啟動專案

### 步驟 1：獲取 Google Maps API 金鑰（約 3 分鐘）

1. 前往 https://console.cloud.google.com/
2. 建立新專案或選擇既有專案
3. 啟用以下 APIs：
   - **Maps JavaScript API**（前端用）
   - **Geocoding API**（後端用）
   - **Places API**（後端用）
4. 建立 2 個 API 金鑰：
   
   **金鑰 A（瀏覽器）：**
   - 應用程式限制：HTTP 參照網址
   - 網站限制：
     - `http://localhost:5173/*`
     - `http://127.0.0.1:5173/*`
   
   **金鑰 B（伺服器）：**
   - 應用程式限制：無（或設 IP 白名單）
   - API 限制：Geocoding API, Places API

### 步驟 2：設定環境變數（約 1 分鐘）

```bash
# 後端
cp backend/.env.example backend/.env
# 編輯 backend/.env，貼上金鑰 B

# 前端
cp frontend/.env.example frontend/.env
# 編輯 frontend/.env，貼上金鑰 A
```

**最小設定（backend/.env）：**
```env
DATABASE_URL=postgresql://trip_user:trip_password@db:5432/trip_timeline_db
JWT_ACCESS_SECRET=dev-secret-at-least-32-chars-long-change-this
JWT_REFRESH_SECRET=dev-refresh-at-least-32-chars-long-change-this
GOOGLE_MAPS_API_KEY=你的伺服器金鑰B
FRONTEND_URL=http://localhost:5173
```

**最小設定（frontend/.env）：**
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=你的瀏覽器金鑰A
```

### 步驟 3：啟動服務（約 30 秒）

```bash
make dev
# 或
docker compose up
```

等待訊息出現：
```
✨ Seeding completed successfully!
🚀 Server running...
📡 Listening on port 3000
```

### 步驟 4：訪問應用（立即）

開啟瀏覽器：
- **前端**：http://localhost:5173
- **API 文檔**：http://localhost:3000/api-docs

### 步驟 5：登入測試帳號（立即）

```
Email: demo@example.com
Password: Demo1234
```

---

## ✅ 驗證安裝

### 檢查後端

```bash
# 健康檢查
curl http://localhost:3000/health

# 預期回應
{"status":"ok","timestamp":"...","environment":"development"}
```

### 檢查資料庫

```bash
make db
# 進入 PostgreSQL CLI

# 執行查詢
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM tags;
SELECT COUNT(*) FROM places;
```

### 檢查容器

```bash
docker compose ps

# 預期顯示
NAME            STATUS         PORTS
hw4-postgres    Up (healthy)   5432->5432
hw4-backend     Up             3000->3000
hw4-frontend    Up             5173->5173
```

---

## 🎯 第一次使用

### 1. 建立你的第一個標籤

- 登入後，側邊欄 Tag Filter Bar
- 點擊 `+` 按鈕
- 輸入名稱（例如："Restaurant"）

### 2. 建立你的第一個地點

- 在地圖上點擊任意位置
- 填寫表單：
  - Title: "My Favorite Cafe"
  - 選擇至少一個標籤
- 點擊 "Create Place"

### 3. 建立你的第一個事件

- 在下方時間軸拖曳選取時間區間
- TODO: Event 表單（待實作）

---

## 🐛 常見問題

### Q: 地圖無法顯示

**A:** 檢查：
1. `frontend/.env` 是否有設 `VITE_GOOGLE_MAPS_API_KEY`
2. 金鑰是否啟用 Maps JavaScript API
3. 金鑰是否有網域限制（localhost:5173）
4. 瀏覽器控制台是否有錯誤訊息

### Q: API 回傳 401

**A:** 
1. 確認已登入
2. 清除瀏覽器 Cookies 後重新登入
3. 檢查後端 JWT_ACCESS_SECRET 是否正確

### Q: Docker 容器無法啟動

**A:**
```bash
# 清理並重建
make clean
make build
```

---

## 📚 下一步

- 📖 閱讀 [README.md](./README.md) 了解完整功能
- 🏗️ 閱讀 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解技術細節
- 🧪 參考 [API_EXAMPLES.md](./API_EXAMPLES.md) 學習 API 使用

---

**需要協助？** 檢查 [README.md](./README.md) 的疑難排解章節。

