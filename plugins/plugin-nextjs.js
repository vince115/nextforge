import fs from 'node:fs';

export default {
  name: 'plugin-nextjs',
  priority: 100,
  // 建立專案本體，失敗就沒有後續可做，直接中止
  critical: true,

  hooks: {
    async validate(ctx) {
      if (fs.existsSync(ctx.projectRoot)) {
        throw new Error(`資料夾已存在：${ctx.projectRoot}`);
      }
    },

    async create(ctx) {
      const pm = ctx.config.packageManager || 'pnpm';
      // shadcn/ui 建立在 Tailwind 之上，所以只有選「None」時才不裝 Tailwind
      const tailwind = ctx.config.ui === 'none' ? '--no-tailwind' : '--tailwind';

      await ctx.utils.runBin('create-next-app@latest', [
        ctx.projectRoot,
        '--typescript',
        tailwind,
        '--eslint',
        '--app',
        '--src-dir',
        '--import-alias', '@/*',
        '--no-git',
        `--use-${pm}`,
        // 其他沒有指定的選項一律用預設值，避免中途跳出問題
        '--yes'
      ], { cwd: process.cwd() });
    }
  }
};
