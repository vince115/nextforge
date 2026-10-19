import { PluginRegistry } from '../plugins/registry.js';

export class PluginExecutor {
  /**
   * 執行指定命令的完整生命週期
   *
   * 錯誤分級：
   * - 插件設定 critical: true（例如建立專案本體）→ 失敗立即中止整個流程
   * - 其他插件 → 失敗時記錄到 context.errors，繼續執行，最後由呼叫端統一回報
   */
  static async run(command, context) {
    const plugins = PluginRegistry.getAll();

    // 定義各命令的生命週期圖譜 (Lifecycle Graph)
    const lifecycleMap = {
      create: [
        'init',
        'resolve',
        'validate',
        'beforeCreate',
        'create',
        'afterCreate',
        'destroy'
      ]
    };

    const phases = lifecycleMap[command];
    if (!phases) throw new Error(`[Executor] 未知的命令類型: ${command}`);

    // 按 Phase -> Plugin 順序執行 Pipeline
    for (const phase of phases) {
      for (const plugin of plugins) {
        const handler = plugin.hooks?.[phase];
        if (typeof handler !== 'function') continue;

        try {
          await handler.call(plugin, context);
        } catch (err) {
          if (plugin.critical) {
            throw new Error(`[${plugin.name}] ${phase} 階段失敗：${err.message}`);
          }
          context.errors.push({ plugin: plugin.name, phase, message: err.message });
          console.warn(`\n⚠️  [${plugin.name}] ${phase} 階段失敗：${err.message}\n`);
        }
      }
    }

    return context.errors;
  }
}
