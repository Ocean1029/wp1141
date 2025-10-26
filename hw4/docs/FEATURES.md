# 功能詳細說明

## 🎯 核心功能

### 1. 認證系統（Authentication）

#### 1.1 使用者註冊

**功能描述：**
- 使用者填寫 email 與 password 註冊
- 系統自動建立預設 "Favorite" 標籤
- 密碼使用 bcrypt 雜湊儲存（12 rounds）

**驗證規則：**
- Email 需符合標準格式
- Password 至少 8 字元
- Password 必須包含字母與數字
- Email 不可重複

**實作位置：**
- Frontend: `src/pages/LoginPage.tsx`
- Backend: `src/services/auth.service.ts`
- Validation: `src/schemas/auth.schema.ts`

#### 1.2 使用者登入

**功能描述：**
- 驗證 email 與 password
- 生成 Access Token（15 分鐘）
- 生成 Refresh Token（7 天）
- 設置 HTTP-only Cookies

**Token 機制：**
```
Access Token  → 用於 API 存取
Refresh Token → 用於換發 Access Token
```

**Cookie 設定：**
```javascript
{
  httpOnly: true,      // JavaScript 無法存取
  sameSite: 'lax',     // CSRF 防護
  secure: false,       // HTTPS 時設為 true
  maxAge: 900000,      // 15 分鐘
  domain: 'localhost'
}
```

#### 1.3 Token 自動刷新

**觸發時機：**
- Access Token 過期時（API 回傳 401）
- Axios interceptor 自動捕獲

**流程：**
```
API Request → 401 Unauthorized
     ↓
Interceptor catches
     ↓
POST /auth/refresh (with refresh_token cookie)
     ↓
Get new access_token
     ↓
Retry original request
     ↓
Success!
```

**實作位置：**
- `frontend/src/api/axiosClient.ts`

---

### 2. 標籤系統（Tags）

#### 2.1 標籤 CRUD

**功能：**
- 建立標籤（name 必填，description 可選）
- 讀取所有標籤（含關聯 Place 數量）
- 更新標籤
- 刪除標籤（檢查不變式）

**不變式檢查：**

刪除 Tag 時，系統檢查是否有 Place 會因此失去所有 Tags：

```typescript
const placesWithOnlyThisTag = tag.places.filter(
  (pt) => pt.place._count.tags === 1
);

if (placesWithOnlyThisTag.length > 0) {
  throw new InvariantViolationError(
    `Cannot delete tag: ${placesWithOnlyThisTag.length} place(s) ` +
    `would be left without tags...`
  );
}
```

#### 2.2 標籤篩選

**功能：**
- 多選標籤進行 OR 篩選
- 即時更新地圖顯示的 Markers
- 顯示每個標籤的 Place 數量

**實作位置：**
- Component: `frontend/src/components/TagFilterBar.tsx`
- API: `GET /api/places?tagIds[]=id1&tagIds[]=id2`

---

### 3. 地點管理（Places）

#### 3.1 地圖點擊建立

**流程：**
```
1. User clicks map at (lat, lng)
   ↓
2. MapCanvas emits coordinates
   ↓
3. MapPage opens PlaceForm with pre-filled coords
   ↓
4. User fills title and selects ≥1 tag
   ↓
5. Submit → POST /api/places
   ↓
6. Backend creates Place + PlaceTag relations
   ↓
7. Frontend reloads and adds Marker
```

**座標精度：**
- 儲存為 `DoublePrecision`（PostgreSQL）
- 前端顯示至小數點後 6 位

#### 3.2 地點 CRUD

**建立：**
- 必須選擇至少一個 Tag
- 座標可從地圖點擊取得，或手動輸入
- Address 可選（未來整合 Reverse Geocoding 自動填入）

**讀取：**
- 列出所有地點（依建立時間排序）
- 依 Tag 篩選（支援多 Tag OR 查詢）
- 包含關聯的 Tags 與 Events 數量

**更新：**
- 可更新 title, lat, lng, address, notes
- Tag 關聯需另外用 add/remove 端點

**刪除：**
- Cascade 刪除 PlaceTag 與 EventPlace

#### 3.3 Tag 關聯管理

**新增 Tag 到 Place：**
```
POST /api/places/:placeId/tags/:tagId
```

**移除 Tag from Place：**
```
DELETE /api/places/:placeId/tags/:tagId

檢查：若移除後 Place 沒有任何 Tag → 422 Error
```

---

### 4. 事件管理（Events）

#### 4.1 時間軸顯示

**FullCalendar 配置：**
- 初始視圖：`timeGridWeek`（週視圖）
- 可切換：`timeGridDay`（日視圖）
- 時間範圍：06:00 - 24:00
- 時區：`local`（使用者裝置）

**Event 顯示：**
```javascript
{
  id: 'event-uuid',
  title: 'Visit Museum',
  start: '2025-02-01T09:00:00Z',
  end: '2025-02-01T11:00:00Z',
  backgroundColor: '#6366f1',
  extendedProps: {
    places: [...],
    notes: '...'
  }
}
```

#### 4.2 拖曳建立 Event

**當前實作：**
- FullCalendar `selectable: true`
- 拖曳選取觸發 `select` 事件
- 回調接收 `start` 與 `end` Date 物件

**待實作：**
- EventForm modal 開啟
- 填寫 title, notes
- 選擇關聯的 Places
- 提交建立

#### 4.3 拖曳調整時間

**已實作：**
- FullCalendar `editable: true`
- 拖曳 Event 移動時間
- `eventDrop` 回調更新後端

**流程：**
```
User drags event
     ↓
FullCalendar updates display
     ↓
eventDrop callback fires
     ↓
PATCH /api/events/:id { startTime, endTime }
     ↓
Backend updates
     ↓
Frontend confirms
```

#### 4.4 Event ↔ Place 聯動

**點擊 Event 聚焦 Place：**
```typescript
onEventClick={(event) => {
  const place = event.places[0].place;
  map.panTo({ lat: place.lat, lng: place.lng });
  map.setZoom(15);
  marker.setAnimation(BOUNCE);
}}
```

**未來擴充：**
- 若 Event 有多個 Places → 框選所有
- 側邊欄顯示 Event 詳情

---

### 5. 地圖功能（Google Maps）

#### 5.1 地圖載入

**使用 @googlemaps/js-api-loader：**
```typescript
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places'],  // 未來用於自動完成
});

await loader.load();
const map = new google.maps.Map(element, {
  center: { lat: 25.0330, lng: 121.5654 },
  zoom: 13,
});
```

**預設中心：**
- 台北市（Taipei 101 附近）
- Zoom level: 13

#### 5.2 Markers 管理

**建立 Marker：**
```typescript
const marker = new google.maps.Marker({
  position: { lat, lng },
  map,
  title: place.title,
  animation: google.maps.Animation.DROP,
});

marker.addListener('click', () => {
  // Show place details
});
```

**篩選更新：**
- Tag 選擇變更 → 清除所有 Markers → 重新建立符合的 Markers

**聚焦動畫：**
- Event 點擊 → Marker `BOUNCE` 動畫 2 秒

#### 5.3 地圖互動

**點擊事件：**
```typescript
map.addListener('click', (e: google.maps.MapMouseEvent) => {
  const lat = e.latLng.lat();
  const lng = e.latLng.lng();
  openPlaceForm({ lat, lng });
});
```

**視野調整：**
- 多個 Markers → `fitBounds` 自動框選
- 單個聚焦 → `panTo` + `setZoom(15)`

---

### 6. Google Maps 服務（Backend）

#### 6.1 Geocoding API

**地址 → 座標：**
```
GET /maps/geocode?address=Taipei+101

Response:
{
  "success": true,
  "data": [{
    "address": "No. 7, Section 5, Xinyi Road...",
    "lat": 25.0339639,
    "lng": 121.5644722,
    "place_id": "ChIJ...",
    "types": ["premise", "point_of_interest"]
  }]
}
```

**座標 → 地址：**
```
GET /maps/reverse-geocode?lat=25.0330&lng=121.5654

Response: 同上格式
```

#### 6.2 Places Search API

**關鍵字搜尋：**
```
GET /maps/search?q=coffee

回傳全域搜尋結果
```

**近點搜尋：**
```
GET /maps/search?q=coffee&lat=25.0330&lng=121.5654&radius=1000

回傳指定座標 1km 範圍內的咖啡店
```

**回應格式：**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "name": "Starbucks",
      "address": "...",
      "lat": 25.0335,
      "lng": 121.5650,
      "place_id": "ChIJ...",
      "types": ["cafe", "food"],
      "rating": 4.2
    }
  ]
}
```

---

## 🎨 使用者介面

### 主畫面配置（MapPage）

```
┌─────────────────────────────────────────────┐
│  Header: Logo | User Email | Logout         │
├──────────┬──────────────────────────────────┤
│ Sidebar  │                                  │
│          │        MapCanvas                 │
│ Tag      │      (Google Maps)               │
│ Filter   │                                  │
│ Bar      │      60% height                  │
│          │                                  │
│ [v] Food ├──────────────────────────────────┤
│ [v] Sight│                                  │
│ [ ] Shop │    TimelinePanel                 │
│          │   (FullCalendar TimeGrid)        │
│ [+] New  │                                  │
│          │      40% height                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

**響應式設計：**
- 桌面（≥1024px）：左側邊欄 280px
- 平板（768-1024px）：左側邊欄 240px
- 手機（<768px）：上下堆疊

### PlaceForm Modal

```
┌─────────────────────────────────┐
│  Add New Place             [X]  │
├─────────────────────────────────┤
│                                 │
│  Title: [________________]      │
│                                 │
│  Lat: [25.0330]  Lng: [121.5654]│
│                                 │
│  Address: [__________________]  │
│                                 │
│  Notes: [____________________]  │
│         [____________________]  │
│                                 │
│  Tags: (至少選一個)              │
│  [✓] Food    [ ] Sights         │
│  [✓] Favorite [ ] Shopping      │
│                                 │
│         [Cancel]  [Create Place]│
└─────────────────────────────────┘
```

---

## 🔄 資料流動

### 完整建立流程範例

**情境：** 使用者想安排去台北 101 的行程

```
Step 1: 在地圖點擊台北 101 位置
  → MapCanvas.onClick(25.0330, 121.5654)
  → MapPage.state.clickedCoords = {lat, lng}
  → PlaceForm opens

Step 2: 填寫地點表單
  → Title: "Taipei 101"
  → Tags: [Sights, Favorite]
  → Submit → POST /api/places

Step 3: 後端處理
  → Validate: tags.length >= 1 ✓
  → Create Place in DB
  → Create PlaceTag relations
  → Return Place with tags

Step 4: 前端更新
  → Reload places
  → MapCanvas adds new Marker
  → TagFilterBar updates counts

Step 5: 建立行程
  → 在 TimeGrid 拖曳 09:00-11:00
  → (TODO: EventForm opens)
  → Select "Taipei 101"
  → Submit → POST /api/events

Step 6: 雙向聯動
  → Click event in Timeline
  → Map focuses on Taipei 101
  → Marker bounces
```

---

## 🛡️ 資料不變式實作

### Invariant 1: Place 至少一個 Tag

**檢查點：**

1. **建立 Place**
```typescript
// Schema 驗證
tags: z.array(z.string().uuid()).min(1, 'At least one tag required')

// Service 驗證
if (data.tags.length === 0) {
  throw new ValidationError('At least one tag required');
}
```

2. **移除 PlaceTag**
```typescript
// 檢查剩餘 Tags 數量
const place = await prisma.place.findUnique({
  where: { id },
  include: { _count: { select: { tags: true } } }
});

if (place._count.tags <= 1) {
  throw new InvariantViolationError(
    'Cannot remove tag: place must have at least one tag'
  );
}
```

3. **刪除 Tag**
```typescript
// 檢查關聯的 Places
const tag = await prisma.tag.findUnique({
  where: { id },
  include: {
    places: {
      include: {
        place: { include: { _count: { select: { tags: true } } } }
      }
    }
  }
});

const orphanedPlaces = tag.places.filter(
  pt => pt.place._count.tags === 1
);

if (orphanedPlaces.length > 0) {
  throw new InvariantViolationError(...);
}
```

### Invariant 2: 資料隔離

**所有寫操作檢查：**

```typescript
// Service 層統一檢查
const resource = await prisma.xxx.findUnique({ where: { id } });

if (!resource) {
  throw new NotFoundError('Resource');
}

if (resource.createdBy !== userId) {
  throw new ForbiddenError('Access denied');
}

// 繼續操作...
```

### Invariant 3: Event 時間驗證

**Zod Schema：**
```typescript
z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
}).refine(
  data => new Date(data.startTime) < new Date(data.endTime),
  { message: 'Start time must be before end time' }
)
```

---

## 🔌 API 設計原則

### RESTful 路由

```
Resource      Collection                  Single Resource
────────      ──────────────              ───────────────
Tags          GET    /api/tags            GET    /api/tags/:id
              POST   /api/tags            PATCH  /api/tags/:id
                                          DELETE /api/tags/:id

Places        GET    /api/places          GET    /api/places/:id
              POST   /api/places          PATCH  /api/places/:id
                                          DELETE /api/places/:id

              Relations:
              POST   /api/places/:id/tags/:tagId
              DELETE /api/places/:id/tags/:tagId

Events        GET    /api/events          GET    /api/events/:id
              POST   /api/events          PATCH  /api/events/:id
                                          DELETE /api/events/:id

              Relations:
              POST   /api/events/:id/places/:placeId
              DELETE /api/events/:id/places/:placeId
```

### 統一回應格式

**成功：**
```json
{
  "success": true,
  "message": "Operation successful",  // Optional
  "data": { ... },
  "count": 5  // For list endpoints
}
```

**失敗：**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { }  // Optional, for validation errors
  }
}
```

---

## 🎓 技術學習點

### 1. JWT 雙 Token 機制

**為何需要 Refresh Token？**
- Access Token 短期 → 減少被竊風險
- Refresh Token 長期 → 避免頻繁登入
- 分離儲存 → 可單獨撤銷

### 2. HTTP-only Cookie vs LocalStorage

| 特性 | HTTP-only Cookie | LocalStorage |
|------|------------------|--------------|
| JavaScript 存取 | ❌ | ✅ |
| XSS 攻擊防護 | ✅ | ❌ |
| 自動帶入請求 | ✅ | ❌（需手動）|
| CSRF 風險 | ⚠️（需 SameSite）| ✅ |
| 本專案使用 | ✅ | ❌ |

### 3. Prisma ORM 優勢

**vs Raw SQL：**
- ✅ 類型安全（auto-generated types）
- ✅ 自動 Migration 管理
- ✅ 關聯載入簡化（include/select）
- ✅ 防護 SQL Injection
- ❌ 複雜查詢可能較慢

### 4. Zod Runtime Validation

**vs TypeScript（compile-time only）：**
- TypeScript：編譯時檢查，runtime 無保護
- Zod：runtime 驗證 + 類型推斷

```typescript
const schema = z.object({ email: z.string().email() });
type SchemaType = z.infer<typeof schema>;  // 自動推斷型別

const data = schema.parse(input);  // Runtime 驗證
```

---

**版本：** 1.0.0  
**最後更新：** 2025-10-26

