# TripTimeline Maps - 架構設計文件

## 一、總體架構

TripTimeline Maps 採用 **前後端分離** + **Modular Monolith** 架構，以下說明各層職責與設計決策。

---

## 二、後端架構（Backend）

### 2.1 技術選型

| 技術 | 版本 | 用途 |
|------|------|------|
| Node.js | 20+ | 執行環境 |
| TypeScript | 5.3+ | 類型安全 |
| Express | 4.x | Web 框架 |
| Prisma | 5.x | ORM |
| PostgreSQL | 15 | 資料庫 |
| Zod | 3.x | Schema 驗證 |
| JWT | 9.x | 認證令牌 |
| bcrypt | 5.x | 密碼雜湊 |
| Google Maps Services | 3.x | Google API 客戶端 |

### 2.2 分層架構

```
Request → Route → Controller → Service → Prisma → Database
                     ↓           ↓
                 Middleware   Validation (Zod)
```

**各層職責：**

1. **Routes**：定義 API 端點與 HTTP 方法
2. **Middleware**：驗證（Auth Guard）、錯誤處理、請求驗證
3. **Controllers**：處理 HTTP 請求/回應、調用 Service
4. **Services**：業務邏輯、資料驗證、外部服務整合
5. **Prisma**：類型安全的資料庫操作
6. **Database**：PostgreSQL 持久化儲存

### 2.3 模組設計

採用 **Modular Monolith** 模式，每個功能為獨立模組：

```
modules/
├── auth/      → 認證與授權
├── tags/      → 標籤管理
├── places/    → 地點管理
├── events/    → 事件/時間軸
└── maps/      → Google Maps 服務代理
```

**每個模組包含：**
- `*.schema.ts` - Zod 驗證規則
- `*.service.ts` - 業務邏輯
- `*.controller.ts` - HTTP 處理
- `*.route.ts` - 路由定義

### 2.4 認證流程（JWT + HTTP-only Cookie）

```
┌──────────┐                                    ┌──────────┐
│  Client  │                                    │  Server  │
└────┬─────┘                                    └────┬─────┘
     │                                                │
     │  POST /auth/login { email, password }         │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                          1. 驗證密碼（bcrypt） │
     │                          2. 生成 Access Token │
     │                          3. 生成 Refresh Token│
     │                                                │
     │  Set-Cookie: access_token=...; HttpOnly       │
     │  Set-Cookie: refresh_token=...; HttpOnly      │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  GET /api/places (with cookies)               │
     ├──────────────────────────────────────────────>│
     │                                                │
     │                          authGuard middleware │
     │                          verify access_token  │
     │                                                │
     │  200 OK { data: [...] }                       │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  (Access token 過期)                           │
     │  GET /api/places → 401 Unauthorized           │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  POST /auth/refresh (with refresh_token)      │
     ├──────────────────────────────────────────────>│
     │                                                │
     │  Set-Cookie: access_token=...; HttpOnly       │
     │<──────────────────────────────────────────────┤
     │                                                │
     │  (重試原請求)                                  │
     │  GET /api/places                              │
     ├──────────────────────────────────────────────>│
     │                                                │
     │  200 OK { data: [...] }                       │
     │<──────────────────────────────────────────────┤
```

**Token 有效期：**
- Access Token: 15 分鐘
- Refresh Token: 7 天

**安全設計：**
- `httpOnly: true` - JavaScript 無法存取
- `sameSite: 'lax'` - 防護 CSRF
- `secure: true` (HTTPS) - 生產環境啟用

### 2.5 資料不變式（Invariants）

**1. Place 必須至少有一個 Tag**

實作位置：
- `PlaceService.createPlace()` - 驗證 `tags.length >= 1`
- `PlaceService.removeTagFromPlace()` - 檢查 `_count.tags > 1`
- `TagService.deleteTag()` - 檢查無 Place 會失去所有 Tags

**2. 使用者資料隔離**

實作位置：
- 所有 Service 方法檢查 `createdBy === userId`
- `authGuard` 確保 `req.user` 存在
- Prisma 查詢加入 `where: { createdBy: userId }`

**3. Event 時間驗證**

實作位置：
- `eventSchema.ts` - Zod refine `startTime < endTime`
- Service 層再次驗證

### 2.6 錯誤處理

**錯誤類型層級：**

```typescript
AppError (基礎類)
├── ValidationError      (400) - 驗證失敗
├── UnauthorizedError    (401) - 未登入/Token 無效
├── ForbiddenError       (403) - 無權限
├── NotFoundError        (404) - 資源不存在
├── ConflictError        (409) - 唯一性衝突
└── InvariantViolationError (422) - 不變式違反
```

**統一錯誤格式：**

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { }  // Optional
  }
}
```

### 2.7 Google Maps 服務整合

**為何使用伺服器端代理：**

1. **安全性**：隱藏 API 金鑰
2. **配額控制**：統一管理 API 呼叫
3. **快取可能**：未來可加入 Redis 快取
4. **格式轉換**：統一回應格式

**API 對應：**

| 功能 | Google API | 本專案端點 |
|------|-----------|-----------|
| 地址→座標 | Geocoding API | `GET /maps/geocode` |
| 座標→地址 | Reverse Geocoding | `GET /maps/reverse-geocode` |
| 地點搜尋 | Places Text Search | `GET /maps/search` |

---

## 三、前端架構（Frontend）

### 3.1 技術選型

| 技術 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 類型安全 |
| Vite | 5.x | 建置工具 |
| React Router | 6.x | 路由管理 |
| FullCalendar | 6.x | 時間軸日曆 |
| Google Maps JS API | latest | 地圖互動 |
| Axios | 1.x | HTTP 客戶端 |

### 3.2 組件架構

```
App (AuthProvider)
├── Router
│   ├── /login → LoginPage
│   └── / → MapPage (Protected)
│       ├── Header (user info, logout)
│       ├── Sidebar
│       │   └── TagFilterBar
│       └── Main
│           ├── MapCanvas (60% height)
│           │   ├── Google Maps
│           │   └── Markers
│           └── TimelinePanel (40% height)
│               └── FullCalendar (TimeGrid)
```

### 3.3 狀態管理

**使用 React Hooks（無 Redux）：**

- `useState` - 本地組件狀態
- `useEffect` - 副作用與資料載入
- `useContext` - Auth 全域狀態
- `useCallback` - 優化回調
- `useRef` - DOM 引用

**狀態提升策略：**
- 共享狀態（places, events, tags）提升到 MapPage
- UI 狀態（modal 開關）保持在組件內
- Auth 狀態使用 Context API

### 3.4 Google Maps 整合

**使用 @googlemaps/js-api-loader：**

```typescript
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],
});

await loader.load();
const map = new google.maps.Map(element, options);
```

**互動功能：**
1. 點擊地圖 → 取得座標 → 開啟 PlaceForm
2. Markers 顯示 Places → 點擊 → 顯示詳情
3. Event 點擊 → 地圖聚焦到關聯 Place
4. Tag 篩選 → 更新顯示的 Markers

### 3.5 FullCalendar 整合

**TimeGrid Plugin 配置：**

```typescript
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  editable={true}
  selectable={true}
  timeZone="local"  // 重要：使用裝置時區
  select={(info) => {
    // 拖曳選取 → 建立 Event
  }}
  eventDrop={(info) => {
    // 拖曳調整時間
  }}
/>
```

**事件格式轉換：**

Backend Event → FullCalendar Event:
```typescript
{
  id: event.id,
  title: event.title,
  start: event.startTime,  // ISO 8601 string
  end: event.endTime,
  extendedProps: {
    places: event.places,
  }
}
```

---

## 四、資料流設計

### 4.1 地點建立流程

```
User clicks map
     ↓
MapCanvas emits (lat, lng)
     ↓
MapPage opens PlaceForm with coords
     ↓
User fills title, selects tags (≥1)
     ↓
PlaceForm submits → placesApi.create()
     ↓
Backend validates tags, creates Place + PlaceTag
     ↓
Frontend reloads places → MapCanvas updates markers
```

### 4.2 事件建立流程

```
User drags on TimeGrid
     ↓
FullCalendar fires 'select' event
     ↓
MapPage captures (start, end)
     ↓
TODO: Open EventForm modal
     ↓
User fills title, selects places
     ↓
eventsApi.create() → Backend
     ↓
Frontend reloads events → TimelinePanel updates
```

### 4.3 標籤篩選流程

```
User toggles tags in TagFilterBar
     ↓
MapPage updates selectedTagIds state
     ↓
useEffect filters places by tags
     ↓
MapCanvas receives filtered places
     ↓
Only matching markers shown on map
```

---

## 五、安全性設計

### 5.1 密碼安全

```typescript
// Registration
const passwordHash = await bcrypt.hash(password, 12);

// Login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

**密碼規則：**
- 最少 8 字元
- 至少一個字母
- 至少一個數字

### 5.2 JWT 機制

**Token 結構：**

```typescript
{
  userId: string;
  email: string;
  iat: number;    // Issued at
  exp: number;    // Expires at
}
```

**簽發流程：**
1. 登入成功 → 生成 Access + Refresh
2. 設置 HTTP-only Cookies
3. 前端自動帶上 Cookies
4. 後端 `authGuard` 驗證

**刷新流程：**
1. Access Token 過期 → 401
2. 前端 Axios interceptor 捕獲
3. 呼叫 `/auth/refresh` with refresh_token
4. 取得新 Access Token
5. 重試原請求

### 5.3 CORS 設定

```typescript
cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,  // 允許 Cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
})
```

---

## 六、Google Maps API 整合

### 6.1 前端（Browser Key）

**用途：**
- Maps JavaScript API（地圖顯示）

**限制設定：**
- Application restrictions: HTTP referrers
- Website restrictions: `http://localhost:5173/*`, `http://127.0.0.1:5173/*`

**安全性：**
- 金鑰暴露在前端 JavaScript
- 透過網域限制防止濫用
- 不要在生產環境使用 localhost 限制

### 6.2 後端（Server Key）

**用途：**
- Geocoding API（地址↔座標）
- Places API（地點搜尋）

**限制設定：**
- Application restrictions: IP addresses（可選）
- 本地開發可無限制

**為何需要伺服器端：**
1. 隱藏 API 金鑰
2. 統一錯誤處理
3. 未來可加入快取層
4. 請求速率控制

### 6.3 API 呼叫流程

**前端直接呼叫（Maps JavaScript API）：**
```
Frontend → Google Maps JS API → Map rendering
```

**後端代理呼叫（Geocoding/Places）：**
```
Frontend → Backend /maps/* → Google API → Response transformation
```

---

## 七、資料模型詳解

### 7.1 User → Tag 關係（1:N）

```sql
-- 每個使用者有多個 Tags
-- 註冊時自動建立 "Favorite" Tag

CREATE UNIQUE INDEX ON tags (created_by, name);
-- 同一使用者的 Tag 名稱不可重複
```

### 7.2 Place ↔ Tag 關係（M:N）

```sql
-- PlaceTag 關聯表
-- 一個 Place 可有多個 Tags
-- 一個 Tag 可標記多個 Places

-- 不變式：Place 至少要有一個 Tag
-- 在 Service 層驗證
```

**刪除邏輯：**
- 刪除 Place → CASCADE 刪除 PlaceTag
- 刪除 Tag → CASCADE 刪除 PlaceTag，但需先檢查不變式

### 7.3 Event ↔ Place 關係（M:N）

```sql
-- EventPlace 關聯表
-- 一個 Event 可關聯多個 Places（例如園區多個入口）
-- 一個 Place 可屬於多個 Events

-- 刪除 Event → CASCADE 刪除 EventPlace
-- 刪除 Place → CASCADE 刪除 EventPlace
```

---

## 八、效能考量

### 8.1 資料庫索引

```prisma
@@index([createdBy])        // 使用者查詢
@@index([lat, lng])         // 地理位置查詢
@@index([startTime, endTime]) // 時間區間查詢
@@unique([createdBy, name]) // 唯一性約束
```

### 8.2 查詢優化

**使用 Prisma 的 include/select：**

```typescript
// Good: 只查詢需要的欄位
prisma.place.findMany({
  include: {
    tags: {
      include: {
        tag: {
          select: { id: true, name: true }
        }
      }
    }
  }
})

// Avoid: 載入所有關聯資料
```

### 8.3 無快取策略（MVP 階段）

**設計決策：**
- 本版完全不做快取
- 所有請求直接查詢資料庫/Google API
- 前端以 debounce 控制搜尋頻率

**未來改進：**
- Server-side: Redis 快取 Google API 回應
- Client-side: React Query 或 SWR

---

## 九、未解決問題與設計決策

### 9.1 標籤刪除策略

**問題：** 刪除 Tag 時，若有 Place 只剩這一個 Tag，該如何處理？

**本版採用：** 拒絕刪除，回傳 422 錯誤

```
DELETE /api/tags/:id
→ 422 Unprocessable Entity
{
  "error": {
    "code": "InvariantViolationError",
    "message": "Cannot delete tag: 3 place(s) would be left without tags..."
  }
}
```

**替代方案（未實作）：**
1. 自動將受影響 Place 改標為 "Favorite"
2. 級聯刪除受影響的 Place（危險）
3. 標記為 "待處理"，要求使用者手動處理

### 9.2 時區處理

**設計：** 全部使用使用者裝置時區

- 後端儲存 `TIMESTAMPTZ`（含時區資訊）
- 前端 FullCalendar 設為 `timeZone: 'local'`
- 顯示時自動轉換為使用者時區

### 9.3 Event 與 Place 的多對一簡化

**未來擴充：** 
- 目前點擊 Event → 聚焦「第一個」關聯 Place
- 未來可改為視野框選所有關聯 Places

---

## 十、未來擴充方向

### 10.1 短期

- [ ] Event 建立/編輯 Modal
- [ ] Tag 建立/編輯 Modal
- [ ] Place 詳情側邊欄
- [ ] Places 搜尋整合到 UI
- [ ] 地圖搜尋框

### 10.2 中期

- [ ] Redis 快取 Google API 回應
- [ ] React Query 狀態管理
- [ ] WebSocket 即時更新
- [ ] 行程匯出（PDF/iCal）
- [ ] 批量操作

### 10.3 長期

- [ ] 多人協作
- [ ] 行程分享與權限
- [ ] AI 行程建議
- [ ] 行動版 App
- [ ] PWA 離線支援

---

## 十一、測試策略（待實作）

### 11.1 後端測試

**單元測試（Unit Tests）：**
- Services 層邏輯測試
- 不變式驗證測試
- JWT 工具函數測試

**整合測試（Integration Tests）：**
- API 端點測試
- 資料庫操作測試
- 認證流程測試

**工具：**
- Jest 或 Vitest
- Supertest（API 測試）
- Prisma Mock

### 11.2 前端測試

**單元測試：**
- 組件渲染測試
- Hooks 測試

**E2E 測試：**
- 登入流程
- 地點建立流程
- 事件建立流程

**工具：**
- Vitest + React Testing Library
- Playwright（E2E）

---

## 十二、部署考量（未實作）

### 12.1 環境變數

**開發環境：**
- JWT Secrets: 弱密碼（僅限本地）
- Cookie Secure: false
- CORS: localhost

**生產環境：**
- JWT Secrets: 強隨機字串（32+ 字元）
- Cookie Secure: true
- Cookie Domain: 實際網域
- CORS: 實際前端網域
- Google API Keys: 嚴格 IP/網域限制

### 12.2 Docker 部署

```bash
# 建置 Production 映像
docker compose -f docker-compose.prod.yml build

# 執行
docker compose -f docker-compose.prod.yml up -d
```

---

## 十三、開發規範

### 13.1 程式碼風格

- TypeScript Strict Mode
- ESLint + Prettier
- 函數與變數使用 camelCase
- 組件與類別使用 PascalCase
- 常數使用 UPPER_SNAKE_CASE

### 13.2 Commit Message

```
feat: Add place creation form
fix: Fix tag deletion invariant check
docs: Update API documentation
refactor: Simplify event service
```

### 13.3 分支策略

```
main (production)
  ↑
develop (integration)
  ↑
feature/* (開發分支)
```

---

## 十四、參考資料

### 官方文件

- [Prisma ORM](https://www.prisma.io/docs)
- [Google Maps JS API](https://developers.google.com/maps/documentation/javascript)
- [FullCalendar](https://fullcalendar.io/docs)
- [Express.js](https://expressjs.com/)
- [React Router](https://reactrouter.com/)

### 相關技術

- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**文件版本：** 1.0.0
**最後更新：** 2025-10-26

