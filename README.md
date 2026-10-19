# nextforge

[![npm](https://img.shields.io/npm/v/@vince115/nextforge)](https://www.npmjs.com/package/@vince115/nextforge)

`nextforge` 是一個基於插件化架構的 CLI 工具，專門用來快速建立及配置 Next.js 專案。它透過互動式的問答流程，幫助你自動配置常用的技術棧（如 Redux、NextAuth、shadcn/ui 等），大幅減少每次開新專案的初始設定時間。

## 快速開始

需要 Node.js 18 以上。

```bash
npx @vince115/nextforge my-app
```

或安裝成全域指令：

```bash
npm install -g @vince115/nextforge
nextforge my-app
```

接著依照互動選單選擇模板、功能、UI 與套件管理工具，完成後：

```bash
cd my-app
pnpm dev
```

## 本機開發

```bash
git clone https://github.com/vince115/nextforge.git
cd nextforge
npm install
node bin/index.js my-app   # 直接執行
npm link                   # 或連結成全域的 nextforge 指令
```

## 目前開發狀態 (v0.8)

核心採用**插件系統**（Plugin-based architecture），v0.8 把各插件修正到可以實際使用：

- **互動式引導 (`lib/interactive.js`)**：選擇專案模板（Next.js / Admin Dashboard）、核心功能（Auth、Redux）、UI 方案以及套件管理工具。
- **生命週期執行器 (`core/executor.js`)**：建立專案分成 `init` -> `resolve` -> `validate` -> `beforeCreate` -> `create` -> `afterCreate` -> `destroy`，各插件掛載到需要的階段。
- **錯誤分級**：插件設定 `critical: true`（例如建立專案本體）失敗時會立即中止；其他插件失敗時繼續執行，最後列出失敗的步驟。
- **Context 工具 (`core/context.js`)**：
  - `install()` / `runBin()`：依使用者選擇的套件管理工具安裝套件或執行 CLI（pnpm / npm / yarn）。
  - `safeInject()`：寫入檔案前檢查路徑不會跑出專案資料夾，且預設不覆蓋既有檔案。
- **內建插件 (`plugins/`)**：
  - `plugin-nextjs.js`：執行 `create-next-app`（TypeScript、App Router、`src/`）；目標資料夾已存在時中止。選擇「None」時不安裝 Tailwind。
  - `plugin-auth.js`：NextAuth v4 + App Router，產生登入頁、受保護的 `/dashboard`、登出按鈕與 `.env.local`（自動產生 `NEXTAUTH_SECRET`）。示範帳號為 `admin@example.com / admin123`，正式使用前請修改 `src/lib/auth.ts`。
  - `plugin-redux.js`：安裝 Redux Toolkit，產生 `src/lib/redux/` 的 store、型別化 hooks 與 `StoreProvider`。
  - `plugin-ui-shadcn.js`：以 `shadcn@latest init` 初始化 shadcn/ui。

已在 Next.js 16 驗證：Admin Dashboard + Auth + Redux + shadcn（pnpm）與 Next.js + 無 UI（npm）兩種組合都能建立並 `next build`，登入、登出與未登入導向流程正常。

## 專案結構

- `bin/` - CLI 的入口點 (`index.js`)。
- `core/` - 核心引擎，包含上下文建立 (`context.js`) 與生命週期執行器 (`executor.js`)。
- `lib/` - 共用工具模組，例如互動式問答 (`interactive.js`)、Log 系統 (`logger.js`) 等。
- `plugins/` - 獨立的功能插件，引擎會自動載入此目錄下的 `plugin-*.js` 檔案。

## 擴充與開發

若要新增功能，只需在 `plugins/` 目錄下新增一個遵循插件介面的檔案，並定義好它在不同生命週期（如 `create`, `afterCreate`）要執行的動作，核心引擎啟動時便會自動將其整合進流程中。
