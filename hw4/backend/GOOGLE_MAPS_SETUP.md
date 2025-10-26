# Google Maps API 配置指南

## 一、API 金鑰分類

### 前端（Browser Key）
- **用途**：`Maps JavaScript API` - 純粹的地圖渲染與前端互動
- **環境變數**：`VITE_GOOGLE_MAPS_JS_KEY`
- **功能**：
  - 渲染地圖（中心點、縮放、樣式）
  - 監聽地圖點擊事件
  - 顯示 Marker
  - 根據 Event 移動視野（fitBounds）
- **安全限制**：必須設定 HTTP referrer 限制
  ```
  http://localhost:5173/*
  http://127.0.0.1:5173/*
  ```

### 後端（Server Key）
- **用途**：`Geocoding API` + `Places API` + `Directions API`（預設啟用）
- **環境變數**：`GOOGLE_MAPS_API_KEY`（在 backend/.env）
- **功能**：
  - Geocoding：地址 ↔ 座標轉換
  - Reverse Geocoding：座標 → 標準化地址
  - Places Search：關鍵字搜尋地點
- **安全限制**：必須設定 IP 或應用程式限制

## 二、當前後端實現

### 1. Geocoding（地址 → 座標）

**API 端點**：`GET /maps/geocode`

**請求範例**：
```bash
curl -X GET "http://localhost:3000/maps/geocode?address=台北101" \
  -H "Cookie: access_token=..."
```

**回應格式**：
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "address": "台灣台北市信義區信義路五段7號",
      "lat": 25.033964,
      "lng": 121.564427,
      "place_id": "ChIJJ5eIcCqpQjQROgRLBhQBw7U",
      "types": ["establishment", "point_of_interest"]
    }
  ]
}
```

**服務實作**：`src/services/maps.service.ts::geocode()`
- 使用 `google-maps-services-js` 客戶端
- 自動錯誤處理與標準化回應

### 2. Reverse Geocoding（座標 → 地址）

**API 端點**：`GET /maps/reverse-geocode`

**請求範例**：
```bash
curl -X GET "http://localhost:3000/maps/reverse-geocode?lat=25.0339&lng=121.5644" \
  -H "Cookie: access_token=..."
```

**回應格式**：
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "address": "台灣台北市信義區",
      "place_id": "ChIJJ5eIcCqpQjQROgRLBhQBw7U",
      "types": ["locality", "political"]
    }
  ]
}
```

### 3. Places Search（地點搜尋）

**API 端點**：`GET /maps/search`

**請求範例**：
```bash
curl -X GET "http://localhost:3000/maps/search?q=咖啡廳&lat=25.0339&lng=121.5644&radius=1500" \
  -H "Cookie: access_token=..."
```

**回應格式**：
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "name": "星巴克咖啡",
      "address": "台北市信義區...",
      "lat": 25.033964,
      "lng": 121.564427,
      "place_id": "ChIJC...",
      "types": ["cafe", "store", "food"],
      "rating": 4.3
    }
  ]
}
```

**實作細節**：
- 使用 `textSearch` API（關鍵字搜尋）
- 支援位置偏置（location + radius）
- 預設半徑 5000 公尺
- 可選參數：lat, lng, radius

## 三、需要新增的功能

根據你的需求，以下是**建議新增的功能**：

### 1. ✅ 已完成
- [x] Geocoding API
- [x] Reverse Geocoding API
- [x] Places Search API
- [x] 統一的錯誤處理
- [x] 標準化回應格式

### 2. 🔨 建議新增

#### Places Details API
**用途**：根據 place_id 取得完整地點資訊（電話、營業時間、網站等）

**新增端點**：`GET /maps/place-details`

**實作建議**：
```typescript
// 在 maps.service.ts 新增
async getPlaceDetails(query: PlaceDetailsQueryDto) {
  const response = await mapsClient.placeDetails({
    params: {
      place_id: query.placeId,
      fields: 'name,formatted_address,geometry,international_phone_number,opening_hours,website',
      key: env.GOOGLE_MAPS_API_KEY,
    },
  });
  
  return {
    success: true,
    data: {
      name: response.data.result.name,
      address: response.data.result.formatted_address,
      lat: response.data.result.geometry.location.lat,
      lng: response.data.result.geometry.location.lng,
      phone: response.data.result.international_phone_number,
      openingHours: response.data.result.opening_hours?.weekday_text,
      website: response.data.result.website,
    },
  };
}
```

#### Autocomplete API（選用）
**用途**：輸入框即時建議
**注意**：需要使用 Session Token 控管成本

#### Directions API（預留擴充）
**用途**：規劃路線（Event 之間的移動路徑）
**當前**：已啟用 API，但尚未實作端點

## 四、資料持久化建議

### 在 Place 模型中儲存
```typescript
// 已存在於 schema.prisma
{
  title: string;        // 使用者自訂標題
  lat: number;          // 座標
  lng: number;          // 座標
  address: string;      // 標準化地址（formatted_address）
  notes: string;        // 使用者備註
  place_id?: string;    // Google Place ID（建議新增此欄位）
}
```

### 建議
1. **儲存固定資訊**：place_id、name、lat/lng、標準地址
2. **避免儲存動態資訊**：電話、營業時間（使用時即取）
3. **不要映射 Google types**：用自己的 Tag 分類

## 五、環境變數配置

### 後端（backend/.env）
```env
GOOGLE_MAPS_API_KEY=your-server-api-key-here
```

### 前端（frontend/.env）
```env
VITE_GOOGLE_MAPS_JS_KEY=your-browser-api-key-here
```

## 六、測試建議

### 測試 Geocoding
```bash
# 測試地址轉座標
curl "http://localhost:3000/maps/geocode?address=台北101" \
  -H "Cookie: access_token=YOUR_TOKEN"
```

### 測試 Reverse Geocoding
```bash
# 測試座標轉地址
curl "http://localhost:3000/maps/reverse-geocode?lat=25.0339&lng=121.5644" \
  -H "Cookie: access_token=YOUR_TOKEN"
```

### 測試 Places Search
```bash
# 測試地點搜尋
curl "http://localhost:3000/maps/search?q=咖啡廳&lat=25.0339&lng=121.5644" \
  -H "Cookie: access_token=YOUR_TOKEN"
```

## 七、成本控管

1. **避免重複呼叫**：對相同地址做快取
2. **限制必選欄位**：Places Details 使用 fields 參數
3. **Session Token**：Autocomplete 使用同一 token
4. **設定配額**：在 Google Cloud Console 設定每日上限

## 八、錯誤處理

後端已實作統一的錯誤回應格式：
```json
{
  "success": false,
  "error": "Geocoding failed: INVALID_REQUEST",
  "results": []
}
```

狀態碼對應：
- `OK`：成功
- `ZERO_RESULTS`：無結果
- `INVALID_REQUEST`：請求無效
- `OVER_QUERY_LIMIT`：超出配額
- `REQUEST_DENIED`：API 金鑰無效

