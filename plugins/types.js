/**
 * Plugin 標準規範定義 (v0.6.1)
 * 所有的 nextforge 插件必須符合此結構
 */
export const PluginContract = {
  name: 'plugin-name',
  version: '1.0.0',

  // ⭐ 新增：優先級 (數字越大優先級越高，預設為 0)
  priority: 0,

  // 關鍵插件：失敗時中止整個流程（預設 false，失敗只記錄並繼續）
  critical: false,

  /**
   * 生命週期鉤子 (Lifecycle Hooks)
   * 支持異步操作 (Async/Await)
   */
  hooks: {
    // 1. 初始化階段
    init: async (context) => {},
    
    // 2. 配置/路徑解析階段
    resolve: async (context) => {},
    
    // 3. 驗證階段 (環境/權限檢查)
    validate: async (context) => {},

    // 4. 核心執行階段
    beforeCreate: async (context) => {},
    afterCreate: async (context) => {},

    beforeRelease: async (context, payload) => {},
    afterRelease: async (context, payload) => {},

    // 5. 清理/銷毀階段
    destroy: async (context) => {},
  }
};
