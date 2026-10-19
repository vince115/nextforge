import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { logger } from '../lib/logger.js';

/**
 * 依套件管理工具組出指令
 * - install: 安裝套件（npm install / pnpm add / yarn add）
 * - dlx:     執行一次性的 CLI（npx / pnpm dlx / yarn dlx）
 */
function packageManagerCommands(pm) {
  switch (pm) {
    case 'npm':
      return { install: ['npm', ['install']], dev: '--save-dev', dlx: ['npx', ['--yes']] };
    case 'yarn':
      return { install: ['yarn', ['add']], dev: '--dev', dlx: ['yarn', ['dlx']] };
    default:
      return { install: ['pnpm', ['add']], dev: '--save-dev', dlx: ['pnpm', ['dlx']] };
  }
}

/**
 * 建立插件執行的環境上下文
 */
export function createContext({ projectRoot, config }) {
  const root = path.resolve(projectRoot);
  const pm = packageManagerCommands(config.packageManager || 'pnpm');

  const exec = (cmd, args, options = {}) =>
    execa(cmd, args, { stdio: 'inherit', ...options });

  return {
    projectRoot: root,
    config,
    // 插件執行失敗的紀錄（非關鍵插件失敗時不中斷，最後統一回報）
    errors: [],
    // 用於插件間交換資料
    state: new Map(),

    utils: {
      exec,

      /**
       * 依使用者選擇的套件管理工具安裝套件
       * install(['next-auth@4'])、install(['@types/x'], { dev: true })
       */
      install(packages, { dev = false } = {}) {
        const [cmd, baseArgs] = pm.install;
        const args = [...baseArgs, ...(dev ? [pm.dev] : []), ...packages];
        return exec(cmd, args, { cwd: root });
      },

      /**
       * 依使用者選擇的套件管理工具執行一次性的 CLI（npx / pnpm dlx / yarn dlx）
       */
      runBin(bin, args = [], options = {}) {
        const [cmd, baseArgs] = pm.dlx;
        return exec(cmd, [...baseArgs, bin, ...args], { cwd: root, ...options });
      },

      /**
       * 安全寫入檔案到專案內
       * - 目標路徑不能跑出專案資料夾
       * - 檔案已存在時預設不覆蓋（force: true 才覆蓋）
       * 回傳是否真的有寫入
       */
      safeInject({ targetPath, content, force = false }) {
        const fullPath = path.resolve(root, targetPath);

        if (fullPath !== root && !fullPath.startsWith(root + path.sep)) {
          throw new Error(`安全檢查失敗：${targetPath} 不在專案資料夾內`);
        }

        if (fs.existsSync(fullPath) && !force) {
          logger.info(`略過 ${targetPath}（檔案已存在）`);
          return false;
        }

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf8');
        logger.success(`已建立 ${targetPath}`);
        return true;
      },
    },
  };
}
