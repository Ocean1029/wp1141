# 測試指南

## 手動測試流程

### 測試環境

```bash
# 確保服務已啟動
make dev

# 等待所有服務健康
docker compose ps
```

---

## 測試案例

### TC-001: 使用者註冊與登入

**步驟：**
1. 訪問 http://localhost:5173/login
2. 點擊 "Sign up"
3. 輸入 email 與 password（至少 8 字元，含字母與數字）
4. 提交表單

**預期結果：**
- 註冊成功訊息
- 自動建立 "Favorite" 標籤
- 自動登入並導向主畫面

**驗證（後端）：**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'

# 檢查是否建立 Favorite tag
curl -X GET http://localhost:3000/api/tags \
  -b cookies.txt | jq '.data[] | select(.name == "Favorite")'
```

---

### TC-002: 建立標籤

**步驟：**
1. 登入後在側邊欄 Tag Filter Bar
2. 點擊 + 按鈕（待實作 UI，目前使用 API）

**API 測試：**
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Restaurant",
    "description": "Places to eat"
  }'
```

**預期結果：**
- Tag 建立成功
- 側邊欄更新顯示新 Tag

---

### TC-003: 地圖點擊建立地點

**步驟：**
1. 在地圖上點擊任意位置
2. PlaceForm 開啟，座標已預填
3. 輸入 Title
4. 選擇至少一個 Tag
5. 提交表單

**預期結果：**
- Place 建立成功
- 地圖上出現新 Marker
- 側邊欄 Tag count 更新

**驗證（API）：**
```bash
curl -X GET http://localhost:3000/api/places \
  -b cookies.txt | jq '.count'
```

---

### TC-004: 標籤篩選

**步驟：**
1. 建立多個 Places，分配不同 Tags
2. 在 TagFilterBar 點選特定 Tag
3. 觀察地圖 Markers

**預期結果：**
- 只顯示有該 Tag 的 Places
- Marker 數量對應 Tag count
- 可多選 Tags（OR 邏輯）

**驗證（API）：**
```bash
curl -X GET "http://localhost:3000/api/places?tagIds=tag-id-1&tagIds=tag-id-2" \
  -b cookies.txt
```

---

### TC-005: FullCalendar 時間軸

**步驟：**
1. 在 TimeGrid 上拖曳選取時間區間
2. （待實作：EventForm 開啟）
3. 使用 API 建立 Event

**API 測試：**
```bash
PLACE_ID="獲取的 place id"

curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d "{
    \"title\": \"Visit Museum\",
    \"startTime\": \"2025-02-01T09:00:00Z\",
    \"endTime\": \"2025-02-01T11:00:00Z\",
    \"placeIds\": [\"$PLACE_ID\"]
  }"
```

**預期結果：**
- Event 顯示在時間軸
- 點擊 Event → 地圖聚焦到關聯 Place

---

### TC-006: Event 拖曳調整時間

**步驟：**
1. 在已有 Event 的格子上拖曳
2. 移動到新時間
3. 放開滑鼠

**預期結果：**
- Event 時間更新
- 後端資料同步

**驗證：**
```bash
curl -X GET "http://localhost:3000/api/events" \
  -b cookies.txt | jq '.data[] | {title, startTime, endTime}'
```

---

### TC-007: Place 不變式 - 必須有 Tag

**測試 A：建立無 Tag 的 Place**

```bash
curl -X POST http://localhost:3000/api/places \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Invalid Place",
    "lat": 25.0330,
    "lng": 121.5654,
    "tags": []
  }'
```

**預期結果：** 400 Bad Request
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

**測試 B：移除 Place 最後一個 Tag**

```bash
# 假設 place-A 只有 tag-1
curl -X DELETE http://localhost:3000/api/places/place-A/tags/tag-1 \
  -b cookies.txt
```

**預期結果：** 422 Unprocessable Entity
```json
{
  "error": {
    "code": "InvariantViolationError",
    "message": "Cannot remove tag: place must have at least one tag..."
  }
}
```

---

### TC-008: Tag 刪除不變式

**步驟：**
1. 建立 Tag A
2. 建立 Place X，只標記 Tag A
3. 嘗試刪除 Tag A

```bash
curl -X DELETE http://localhost:3000/api/tags/tag-A \
  -b cookies.txt
```

**預期結果：** 422 Unprocessable Entity
```json
{
  "error": {
    "code": "InvariantViolationError",
    "message": "Cannot delete tag: 1 place(s) would be left without tags..."
  }
}
```

---

### TC-009: 權限驗證

**測試 A：未登入存取受保護資源**

```bash
curl -X GET http://localhost:3000/api/places
# 無 cookies
```

**預期：** 401 Unauthorized

**測試 B：存取他人資源**

```bash
# 使用者 A 登入
curl -X POST http://localhost:3000/auth/login \
  -c cookies-a.txt \
  -d '{"email": "userA@example.com", "password": "..."}'

# 使用者 B 建立 Place
# 使用者 A 嘗試刪除 B 的 Place
curl -X DELETE http://localhost:3000/api/places/place-of-user-B \
  -b cookies-a.txt
```

**預期：** 403 Forbidden

---

### TC-010: Token 刷新機制

**步驟：**
1. 登入並保存 cookies
2. 等待 Access Token 過期（15 分鐘）
3. 呼叫受保護的 API

**預期行為：**
- 前端 Axios interceptor 捕獲 401
- 自動呼叫 `/auth/refresh`
- 取得新 Access Token
- 重試原請求
- 使用者無感知

**手動測試：**
```bash
# 登入
curl -X POST http://localhost:3000/auth/login -c cookies.txt -d '...'

# 等待 16 分鐘（或修改 JWT_ACCESS_EXPIRES_IN=10s 測試）

# 呼叫 API
curl -X GET http://localhost:3000/api/places -b cookies.txt

# 檢查是否自動刷新
```

---

### TC-011: Google Maps 服務

**Geocoding：**
```bash
curl -X GET "http://localhost:3000/maps/geocode?address=Taipei+101" \
  -b cookies.txt
```

**預期：** 回傳座標 25.033, 121.565

**Reverse Geocoding：**
```bash
curl -X GET "http://localhost:3000/maps/reverse-geocode?lat=25.0330&lng=121.5654" \
  -b cookies.txt
```

**預期：** 回傳地址包含 "Xinyi Road"

**Places Search：**
```bash
curl -X GET "http://localhost:3000/maps/search?q=coffee&lat=25.0330&lng=121.5654&radius=1000" \
  -b cookies.txt
```

**預期：** 回傳附近咖啡店列表

---

## 自動化測試（待實作）

### 後端單元測試

```typescript
// Example: Tag service test
describe('TagService', () => {
  it('should create default Favorite tag on user registration', async () => {
    const user = await authService.register({
      email: 'test@example.com',
      password: 'Test1234'
    });

    const tags = await tagService.getAllTags(user.id, {});
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe('Favorite');
  });

  it('should prevent tag deletion if places would be orphaned', async () => {
    // Setup: create tag and place with only that tag
    // Attempt to delete tag
    // Expect: InvariantViolationError
  });
});
```

### 前端組件測試

```typescript
// Example: PlaceForm test
describe('PlaceForm', () => {
  it('should require at least one tag', async () => {
    render(<PlaceForm tags={[]} ... />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Test Place' }
    });

    // Submit without selecting tags
    fireEvent.click(screen.getByText('Create Place'));

    // Expect error message
    expect(screen.getByText(/at least one tag/i)).toBeInTheDocument();
  });
});
```

---

## 效能測試

### 負載測試（使用 Apache Bench）

```bash
# 測試登入端點
ab -n 100 -c 10 -p login.json -T 'application/json' \
  http://localhost:3000/auth/login

# 測試 Places API
ab -n 1000 -c 50 -H "Cookie: access_token=..." \
  http://localhost:3000/api/places
```

### 資料庫效能

```sql
-- 檢查慢查詢
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 檢查索引使用
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

---

## 安全性測試

### OWASP Top 10 檢查

- [x] SQL Injection - Prisma ORM 防護
- [x] XSS - HTTP-only Cookies
- [x] CSRF - SameSite Cookie
- [x] Authentication - JWT + bcrypt
- [x] Broken Access Control - authGuard + ownership check
- [x] Security Misconfiguration - Environment variables
- [ ] Vulnerable Dependencies - 需定期更新

### 滲透測試工具

```bash
# 使用 OWASP ZAP 或 Burp Suite
# 測試目標：http://localhost:3000
```

---

## 測試檢查清單

### 功能測試

- [ ] 註冊流程完整
- [ ] 登入/登出正常
- [ ] Token 自動刷新
- [ ] Tag CRUD 操作
- [ ] Place CRUD 操作
- [ ] Event CRUD 操作
- [ ] Tag 篩選地點
- [ ] Event 聚焦地點
- [ ] 地圖點擊建立
- [ ] FullCalendar 拖曳

### 不變式測試

- [ ] 無 Tag Place 拒絕
- [ ] 最後 Tag 移除拒絕
- [ ] Tag 刪除檢查
- [ ] 時間驗證
- [ ] 權限檢查

### 整合測試

- [ ] 前後端通訊
- [ ] Cookie 傳遞
- [ ] CORS 設定
- [ ] Google API 呼叫

---

**測試覆蓋目標：**
- Unit tests: 80%+
- Integration tests: 60%+
- E2E tests: 主要流程

