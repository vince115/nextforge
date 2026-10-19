export default {
  name: 'plugin-ui-shadcn',
  priority: 40,

  hooks: {
    async afterCreate(ctx) {
      if (ctx.config.ui !== 'shadcn') return;

      // shadcn-ui 已改名為 shadcn；--defaults 使用預設設定，不跳出互動問題
      await ctx.utils.runBin('shadcn@latest', ['init', '--defaults', '--yes']);
    }
  }
};
