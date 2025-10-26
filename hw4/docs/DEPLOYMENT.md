# 部署指南

## 生產環境部署

### 前置準備

1. **準備 VPS 或雲端主機**
   - Ubuntu 20.04+ 或其他 Linux 發行版
   - Docker 與 Docker Compose 已安裝
   - 網域已設定 DNS A 記錄

2. **SSL 憑證**
   - Let's Encrypt（推薦）
   - 或其他 SSL 憑證提供商

3. **環境變數**
   - 強隨機 JWT Secrets（至少 32 字元）
   - 生產環境的 Google Maps API 金鑰
   - 實際網域名稱

---

## 步驟一：環境變數設定

### Backend (.env)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://prod_user:strong_password@db:5432/prod_db

# 生成強隨機密鑰
# openssl rand -base64 32
JWT_ACCESS_SECRET=生成的隨機字串32+字元
JWT_REFRESH_SECRET=生成的隨機字串32+字元
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 生產環境 Google Maps API Key
GOOGLE_MAPS_API_KEY=你的生產環境金鑰

# 實際前端網域
FRONTEND_URL=https://your-domain.com

# Cookie 設定
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
```

### Frontend (.env)

```env
# 實際後端 API URL
VITE_API_URL=https://api.your-domain.com

# 瀏覽器 API Key（網域限制為你的實際網域）
VITE_GOOGLE_MAPS_API_KEY=你的瀏覽器金鑰
```

---

## 步驟二：Docker Compose 生產配置

建立 `docker-compose.prod.yml`：

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: prod_db
      POSTGRES_USER: prod_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      NODE_ENV: production
    env_file:
      - ./backend/.env
    depends_on:
      - db
    networks:
      - internal
      - web

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    depends_on:
      - backend
    networks:
      - web

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - web

volumes:
  postgres_data:

networks:
  internal:
  web:
```

---

## 步驟三：Nginx 反向代理

### nginx.conf

```nginx
http {
  upstream backend {
    server backend:3000;
  }

  upstream frontend {
    server frontend:5173;
  }

  server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # Frontend
    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;
    }

    # Auth endpoints
    location /auth/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
    }

    # Maps endpoints
    location /maps/ {
      proxy_pass http://backend;
      proxy_http_version 1.1;
    }
  }
}
```

---

## 步驟四：部署流程

### 1. 上傳專案到伺服器

```bash
# 從本地
scp -r hw4 user@your-server:/opt/

# 或使用 Git
git clone <your-repo> /opt/hw4
cd /opt/hw4
```

### 2. 設定環境變數

```bash
cd /opt/hw4

# 複製並編輯環境變數
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 使用安全的編輯器（vim/nano）
nano backend/.env
nano frontend/.env
```

### 3. 建置與啟動

```bash
# 建置 Production 映像
docker compose -f docker-compose.prod.yml build

# 啟動服務
docker compose -f docker-compose.prod.yml up -d

# 執行資料庫 Migration
docker compose exec backend npm run prisma:deploy

# 填充初始資料（可選）
docker compose exec backend npm run seed
```

### 4. 驗證部署

```bash
# 檢查容器狀態
docker compose ps

# 查看日誌
docker compose logs -f backend
docker compose logs -f frontend

# 測試健康檢查
curl https://your-domain.com/health
```

---

## 步驟五：SSL 憑證（Let's Encrypt）

### 使用 Certbot

```bash
# 安裝 Certbot
sudo apt-get install certbot

# 生成憑證
sudo certbot certonly --standalone -d your-domain.com

# 憑證會儲存在
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# 複製到專案
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/

# 設定自動更新
sudo crontab -e
# 加入：0 0 * * 0 certbot renew --quiet
```

---

## 安全檢查清單

### 部署前

- [ ] 所有 JWT Secrets 使用強隨機字串
- [ ] Google API Keys 設定生產環境限制
- [ ] 資料庫密碼強度足夠
- [ ] COOKIE_SECURE=true
- [ ] CORS 限制為實際網域
- [ ] .env 檔案不在版本控制中
- [ ] SSL 憑證有效

### 部署後

- [ ] 測試 HTTPS 正常運作
- [ ] 測試登入/登出流程
- [ ] 測試 API 端點
- [ ] 檢查錯誤日誌
- [ ] 設定備份策略
- [ ] 監控 API 配額

---

## 監控與維護

### 日誌管理

```bash
# 查看即時日誌
docker compose logs -f

# 只看後端
docker compose logs -f backend

# 儲存日誌
docker compose logs > logs.txt
```

### 資料庫備份

```bash
# 備份
docker compose exec db pg_dump -U prod_user prod_db > backup.sql

# 還原
docker compose exec -T db psql -U prod_user prod_db < backup.sql
```

### 更新應用

```bash
# Pull 最新程式碼
git pull origin main

# 重新建置
docker compose -f docker-compose.prod.yml build

# 重啟服務（零停機時間）
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

---

## 效能優化

### 資料庫

```sql
-- 建立額外索引
CREATE INDEX idx_places_lat_lng ON places(lat, lng);
CREATE INDEX idx_events_time_range ON events(start_time, end_time);

-- 定期 VACUUM
VACUUM ANALYZE;
```

### Nginx 快取

```nginx
# 靜態資源快取
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

### Docker 資源限制

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
```

---

## 故障排除

### 容器無法啟動

```bash
# 查看詳細錯誤
docker compose logs backend

# 重建容器
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 資料庫連線問題

```bash
# 進入資料庫容器
docker compose exec db psql -U prod_user -d prod_db

# 檢查連線
\conninfo
```

### SSL 問題

```bash
# 測試憑證
openssl s_client -connect your-domain.com:443

# 更新憑證
sudo certbot renew
```

---

**⚠️ 重要提醒：**

1. 絕不在公開 Repo 提交 `.env` 檔案
2. 定期更新依賴套件
3. 定期備份資料庫
4. 監控 Google API 使用量
5. 設定防火牆規則

---

**本指南適用於小型部署。大型生產環境建議使用 Kubernetes、負載平衡器、CDN 等企業級方案。**

