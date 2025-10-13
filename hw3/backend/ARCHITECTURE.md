# Backend Architecture v2.0

## Overview

這個專案採用現代化的 **Modular Monolith** 架構，結合 **TypeScript**、**Prisma ORM** 和 **ES Modules**，提供類型安全、可擴展且易於維護的後端服務。

## 技術棧

### 核心技術
- **TypeScript 5.3+**: 完整的類型安全和現代 JavaScript 特性
- **Node.js 20+**: ES Module 原生支持
- **Express 4**: Web 框架
- **Prisma 5**: 現代化 ORM，提供類型安全的資料庫訪問
- **Zod**: Schema 驗證和類型推斷
- **PostgreSQL**: 關聯式資料庫

### 開發工具
- **tsx**: TypeScript 執行器（開發環境）
- **nodemon**: 自動重啟
- **Prisma Studio**: 資料庫視覺化工具

## 專案結構

```
src/
├── server.ts                       # 應用程式入口點
├── config/                         # 配置管理
│   ├── env.ts                     # 環境變數驗證 (使用 Zod)
│   └── prisma.ts                  # Prisma Client 單例
├── shared/                         # 共享資源
│   ├── errors/                    # 自定義錯誤類
│   │   └── AppError.ts
│   ├── middleware/                # 全域中間件
│   │   ├── errorHandler.ts       # 統一錯誤處理
│   │   └── asyncHandler.ts       # 異步處理包裝器
│   └── types/                     # 共享類型定義
└── modules/                        # 功能模組（Modular Monolith）
    ├── diaries/                   # 日記模組
    │   ├── diary.dto.ts          # Data Transfer Objects & Validation
    │   ├── diary.repository.ts   # 資料存取層
    │   ├── diary.service.ts      # 業務邏輯層
    │   ├── diary.controller.ts   # HTTP 處理層
    │   └── diary.routes.ts       # 路由定義
    ├── themes/                    # 主題模組（待實作）
    └── segments/                  # 段落模組（待實作）
```

## 架構原則

### 1. Modular Monolith

每個功能模組（如 `diaries`）都是獨立的，包含自己的：
- **DTOs**: 定義 API 輸入/輸出結構和驗證規則
- **Repository**: 封裝資料庫操作
- **Service**: 實現業務邏輯
- **Controller**: 處理 HTTP 請求/響應
- **Routes**: 定義 API 端點

這種結構的優勢：
- ✅ 高內聚低耦合
- ✅ 易於測試和維護
- ✅ 可以輕鬆轉換為微服務（如需要）
- ✅ 清晰的職責劃分

### 2. 分層架構 (Layered Architecture)

```
Request → Route → Controller → Service → Repository → Database
                                   ↓
                              Validation (DTO)
```

**各層職責**:

- **Routes**: 定義 URL 路徑和 HTTP 方法
- **Controller**: 
  - 處理 HTTP 請求/響應
  - 驗證輸入（使用 DTO schemas）
  - 調用 Service 層
- **Service**: 
  - 實現業務邏輯
  - 協調多個 Repository
  - 處理業務級錯誤
- **Repository**: 
  - 資料庫 CRUD 操作
  - 使用 Prisma Client
  - 返回 Prisma 類型

### 3. 類型安全

**端到端類型安全**:

1. **資料庫 Schema** (Prisma):
```prisma
model Diary {
  id        String   @id @default(uuid())
  title     String?
  content   String
  createdAt DateTime @default(now())
}
```

2. **Prisma 自動生成類型**:
```typescript
import type { Diary } from '@prisma/client';
```

3. **DTO 驗證** (Zod):
```typescript
const createDiarySchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1),
});
```

4. **類型推斷**:
```typescript
type CreateDiaryDto = z.infer<typeof createDiarySchema>;
```

### 4. 錯誤處理

**統一錯誤處理機制**:

1. **自定義錯誤類**:
```typescript
class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}
```

2. **全域錯誤中間件**:
   - 處理 AppError
   - 處理 Zod 驗證錯誤
   - 處理 Prisma 錯誤
   - 處理未知錯誤

3. **異步錯誤處理**:
```typescript
router.get('/', asyncHandler(controller.getAll));
```

## 使用範例

### 創建新的功能模組

以 `themes` 模組為例：

1. **建立 DTO** (`theme.dto.ts`):
```typescript
export const createThemeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  colorId: z.number().int().positive().optional(),
});
```

2. **建立 Repository** (`theme.repository.ts`):
```typescript
export class ThemeRepository {
  async findAll() {
    return prisma.theme.findMany({
      include: { color: true },
    });
  }
}
```

3. **建立 Service** (`theme.service.ts`):
```typescript
export class ThemeService {
  async getAllThemes() {
    return themeRepository.findAll();
  }
}
```

4. **建立 Controller** (`theme.controller.ts`):
```typescript
export class ThemeController {
  async getAllThemes(req: Request, res: Response) {
    const themes = await themeService.getAllThemes();
    res.json({ success: true, data: themes });
  }
}
```

5. **建立 Routes** (`theme.routes.ts`):
```typescript
router.get('/', asyncHandler(controller.getAllThemes));
```

6. **註冊到主應用** (`server.ts`):
```typescript
app.use('/api/themes', themeRoutes);
```

## 資料庫遷移

### 開發環境

```bash
# 創建遷移
pnpm prisma:migrate

# 應用遷移並生成 Prisma Client
pnpm prisma:generate

# 查看資料庫
pnpm prisma:studio
```

### 生產環境

```bash
# 僅應用遷移（不會提示）
prisma migrate deploy
```

## 環境變數

必需的環境變數（在 `.env`）:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/db_name
```

所有環境變數都會在啟動時通過 Zod 進行驗證。

## 最佳實踐

1. **始終使用 DTO 驗證輸入**
2. **Service 層拋出語義化錯誤**（如 `NotFoundError`）
3. **Repository 只處理資料訪問，不包含業務邏輯**
4. **使用 Prisma 的 include/select 優化查詢**
5. **所有 async 路由處理器包裝在 asyncHandler 中**
6. **使用 TypeScript strict mode**
7. **保持模組獨立，避免循環依賴**

## 遷移指南

從舊版 (CommonJS + raw SQL) 遷移到新版：

### 差異對照

| 項目 | 舊版 | 新版 |
|-----|------|------|
| 模組系統 | CommonJS (`require`) | ES Module (`import`) |
| 語言 | JavaScript | TypeScript |
| 資料庫訪問 | 原生 `pg` + SQL | Prisma ORM |
| 驗證 | 手動檢查 | Zod Schema |
| 錯誤處理 | try-catch 散落各處 | 統一錯誤中間件 |
| 架構 | 扁平路由文件 | Modular Monolith |

### 遷移步驟

1. 安裝新依賴: `pnpm install`
2. 運行 Prisma 遷移: `pnpm prisma:migrate`
3. 生成 Prisma Client: `pnpm prisma:generate`
4. 使用 `tsx` 運行開發服務器: `pnpm dev`

## 性能考量

- **Connection Pooling**: Prisma 自動管理連接池
- **查詢優化**: 使用 Prisma 的 `select` 和 `include` 減少數據傳輸
- **索引**: 在 Prisma schema 中定義 `@@index`
- **事務**: 使用 Prisma 的交互式事務 API

## 測試策略（待實作）

建議的測試層級：

1. **Unit Tests**: 測試 Service 和 Repository
2. **Integration Tests**: 測試 API 端點
3. **E2E Tests**: 完整流程測試

使用工具：
- Jest / Vitest
- Supertest (API 測試)
- Prisma Mock

## 未來擴展

- [ ] 實作 Themes 和 Segments 模組
- [ ] 添加身份驗證和授權
- [ ] 實作快取層（Redis）
- [ ] 添加日誌系統（Winston/Pino）
- [ ] API 文檔（Swagger/OpenAPI）
- [ ] 實作完整的測試套件
- [ ] 添加性能監控
- [ ] 實作 CQRS 模式（如需要）

