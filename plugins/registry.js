export class PluginRegistry {
  static plugins = [];

  /**
   * 註冊插件，並即時依 priority 降序排序
   */
  static register(plugin) {
    if (!plugin?.name) throw new Error('插件必須具備名稱');
    
    this.plugins.push({
      priority: 0, 
      ...plugin
    });

    // 數字越大，執行順序越靠前
    this.plugins.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  static getAll() {
    return this.plugins;
  }
}
