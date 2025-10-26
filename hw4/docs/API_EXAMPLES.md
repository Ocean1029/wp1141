# TripTimeline Maps - API 使用範例

本文件提供完整的 API 測試範例，包含各種情境與錯誤處理。

## 前置作業

所有範例假設：
- 後端運行於 `http://localhost:3000`
- 已建立測試帳號並登入
- Cookies 儲存於 `cookies.txt`

---

## 1. 認證流程（Auth）

### 1.1 註冊新使用者

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "alice@example.com",
    "password": "Alice1234"
  }'
```

**成功回應（201）：**
```json
{
  "success": true,
  "message": "User registered successfully. Default \"Favorite\" tag created.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "createdAt": "2025-10-26T10:00:00.000Z"
  }
}
```

**失敗回應（409 Conflict）：**
```json
{
  "error": {
    "code": "ConflictError",
    "message": "Email already registered"
  }
}
```

### 1.2 登入

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "demo@example.com",
    "password": "Demo1234"
  }'
```

**成功後 cookies.txt 包含：**
```
access_token=eyJhbGciOiJIUzI1NiIs...
refresh_token=eyJhbGciOiJIUzI1NiIs...
```

### 1.3 取得當前使用者

```bash
curl -X GET http://localhost:3000/auth/me \
  -b cookies.txt
```

### 1.4 刷新 Access Token

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -b cookies.txt
```

### 1.5 登出

```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

---

## 2. 標籤管理（Tags）

### 2.1 取得所有標籤

```bash
curl -X GET http://localhost:3000/api/tags \
  -b cookies.txt
```

**回應：**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "tag-1",
      "name": "Favorite",
      "description": "Default favorite places",
      "createdBy": "user-id",
      "createdAt": "...",
      "_count": {
        "places": 2
      }
    },
    {
      "id": "tag-2",
      "name": "Food",
      "description": "Restaurants and cafes",
      "_count": {
        "places": 5
      }
    }
  ]
}
```

### 2.2 建立標籤

```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Museums",
    "description": "Cultural and historical museums"
  }'
```

### 2.3 更新標籤

```bash
curl -X PATCH http://localhost:3000/api/tags/tag-id \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Art Museums",
    "description": "Art galleries and museums"
  }'
```

### 2.4 刪除標籤（檢查不變式）

```bash
curl -X DELETE http://localhost:3000/api/tags/tag-id \
  -b cookies.txt
```

**成功（200）：**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

**失敗 - 違反不變式（422）：**
```json
{
  "error": {
    "code": "InvariantViolationError",
    "message": "Cannot delete tag: 3 place(s) would be left without any tags. Please assign other tags to these places first, or delete the places."
  }
}
```

### 2.5 搜尋標籤

```bash
curl -X GET "http://localhost:3000/api/tags?search=food" \
  -b cookies.txt
```

---

## 3. 地點管理（Places）

### 3.1 取得所有地點

```bash
curl -X GET http://localhost:3000/api/places \
  -b cookies.txt
```

### 3.2 依標籤篩選地點

```bash
# 單一標籤
curl -X GET "http://localhost:3000/api/places?tagIds=tag-id-1" \
  -b cookies.txt

# 多個標籤（OR 邏輯）
curl -X GET "http://localhost:3000/api/places?tagIds=tag-id-1&tagIds=tag-id-2" \
  -b cookies.txt
```

### 3.3 建立地點（必須有標籤）

```bash
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "National Palace Museum",
    "lat": 25.1023,
    "lng": 121.5485,
    "address": "No. 221, Section 2, Zhishan Road, Shilin District",
    "notes": "Famous Chinese artifacts collection",
    "tags": ["tag-id-1", "tag-id-2"]
  }'
```

**失敗 - 無標籤（400）：**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": "tags",
        "message": "At least one tag is required"
      }
    ]
  }
}
```

### 3.4 更新地點

```bash
curl -X PATCH http://localhost:3000/api/places/place-id \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "National Palace Museum (Updated)",
    "notes": "Must visit on weekdays to avoid crowds"
  }'
```

### 3.5 新增標籤到地點

```bash
curl -X POST http://localhost:3000/api/places/place-id/tags/tag-id \
  -b cookies.txt
```

### 3.6 移除地點標籤（檢查不變式）

```bash
curl -X DELETE http://localhost:3000/api/places/place-id/tags/tag-id \
  -b cookies.txt
```

**失敗 - 最後一個標籤（422）：**
```json
{
  "error": {
    "code": "InvariantViolationError",
    "message": "Cannot remove tag: place must have at least one tag. Please add another tag before removing this one."
  }
}
```

### 3.7 刪除地點

```bash
curl -X DELETE http://localhost:3000/api/places/place-id \
  -b cookies.txt
```

---

## 4. 事件管理（Events）

### 4.1 取得所有事件

```bash
curl -X GET http://localhost:3000/api/events \
  -b cookies.txt
```

### 4.2 時間區間查詢

```bash
curl -X GET "http://localhost:3000/api/events?from=2025-02-01T00:00:00Z&to=2025-02-28T23:59:59Z" \
  -b cookies.txt
```

### 4.3 依地點篩選事件

```bash
curl -X GET "http://localhost:3000/api/events?placeId=place-id" \
  -b cookies.txt
```

### 4.4 建立事件

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Morning Hike",
    "startTime": "2025-02-15T07:00:00Z",
    "endTime": "2025-02-15T10:00:00Z",
    "notes": "Bring water and snacks",
    "placeIds": ["place-id-1", "place-id-2"]
  }'
```

**失敗 - 時間驗證（400）：**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": "startTime",
        "message": "Start time must be before end time"
      }
    ]
  }
}
```

### 4.5 更新事件

```bash
curl -X PATCH http://localhost:3000/api/events/event-id \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Morning Hike (Updated)",
    "startTime": "2025-02-15T07:30:00Z",
    "endTime": "2025-02-15T11:00:00Z"
  }'
```

### 4.6 新增地點到事件

```bash
curl -X POST http://localhost:3000/api/events/event-id/places/place-id \
  -b cookies.txt
```

### 4.7 移除事件地點關聯

```bash
curl -X DELETE http://localhost:3000/api/events/event-id/places/place-id \
  -b cookies.txt
```

---

## 5. 地圖服務（Maps）

### 5.1 地址轉座標（Geocoding）

```bash
curl -X GET "http://localhost:3000/maps/geocode?address=Taipei%20101" \
  -b cookies.txt
```

**回應：**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "address": "No. 7, Section 5, Xinyi Road, Xinyi District, Taipei City, Taiwan",
      "lat": 25.0339639,
      "lng": 121.5644722,
      "place_id": "ChIJXxkfHlStQjQRf9RUW...",
      "types": ["premise", "point_of_interest"]
    }
  ]
}
```

### 5.2 座標轉地址（Reverse Geocoding）

```bash
curl -X GET "http://localhost:3000/maps/reverse-geocode?lat=25.0330&lng=121.5654" \
  -b cookies.txt
```

### 5.3 搜尋附近地點

```bash
# 基本搜尋
curl -X GET "http://localhost:3000/maps/search?q=coffee%20shop" \
  -b cookies.txt

# 帶位置偏好
curl -X GET "http://localhost:3000/maps/search?q=coffee&lat=25.0330&lng=121.5654&radius=1000" \
  -b cookies.txt
```

**回應：**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "name": "Starbucks Xinyi",
      "address": "No. 11, Section 5, Xinyi Road...",
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

## 6. 完整測試劇本

### 情境：規劃台北一日遊

```bash
# Step 1: 註冊並登入
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "trip@example.com", "password": "Trip1234"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "trip@example.com", "password": "Trip1234"}'

# Step 2: 建立標籤
TAG_FOOD=$(curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "Food", "description": "Restaurants"}' \
  | jq -r '.data.id')

TAG_SIGHTS=$(curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "Sights", "description": "Tourist spots"}' \
  | jq -r '.data.id')

# Step 3: 建立地點
PLACE_1=$(curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Taipei 101\",
    \"lat\": 25.0330,
    \"lng\": 121.5654,
    \"tags\": [\"$TAG_SIGHTS\"]
  }" \
  | jq -r '.data.id')

PLACE_2=$(curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Din Tai Fung\",
    \"lat\": 25.0360,
    \"lng\": 121.5645,
    \"tags\": [\"$TAG_FOOD\"]
  }" \
  | jq -r '.data.id')

# Step 4: 建立事件
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Visit Taipei 101\",
    \"startTime\": \"2025-02-01T09:00:00Z\",
    \"endTime\": \"2025-02-01T11:00:00Z\",
    \"placeIds\": [\"$PLACE_1\"]
  }"

curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Lunch at Din Tai Fung\",
    \"startTime\": \"2025-02-01T12:00:00Z\",
    \"endTime\": \"2025-02-01T13:30:00Z\",
    \"placeIds\": [\"$PLACE_2\"]
  }"

# Step 5: 查看結果
echo "All places:"
curl -X GET http://localhost:3000/api/places -b cookies.txt | jq

echo "Events on Feb 1:"
curl -X GET "http://localhost:3000/api/events?from=2025-02-01T00:00:00Z&to=2025-02-01T23:59:59Z" \
  -b cookies.txt | jq
```

---

## 7. 錯誤處理範例

### 7.1 未登入訪問受保護資源

```bash
curl -X GET http://localhost:3000/api/places
# No cookies → 401
```

**回應：**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No access token provided"
  }
}
```

### 7.2 驗證失敗

```bash
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Invalid Place",
    "lat": 25.0330,
    "lng": 121.5654
  }'
# Missing 'tags' field → 400
```

### 7.3 權限不足

```bash
# 嘗試刪除別人的地點
curl -X DELETE http://localhost:3000/api/places/other-user-place-id \
  -b cookies.txt
# → 403 Forbidden
```

---

## 8. 使用 jq 美化輸出

安裝 jq：
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

範例：
```bash
# 只顯示 email
curl -s http://localhost:3000/auth/me -b cookies.txt | jq '.data.email'

# 列出所有 Tag 名稱
curl -s http://localhost:3000/api/tags -b cookies.txt | jq '.data[].name'

# 計算地點數量
curl -s http://localhost:3000/api/places -b cookies.txt | jq '.count'
```

---

## 9. 健康檢查

```bash
curl http://localhost:3000/health
```

**回應：**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T12:00:00.000Z",
  "environment": "development"
}
```

---

## 10. Swagger UI

訪問互動式 API 文檔：
```
http://localhost:3000/api-docs
```

可直接在瀏覽器測試 API，無需 curl。

---

**提示：** 所有時間使用 ISO 8601 格式（UTC 時區），例如 `2025-02-01T09:00:00Z`

