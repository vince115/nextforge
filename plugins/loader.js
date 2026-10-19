import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PluginRegistry } from './registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 自動載入所有 plugin- 開頭的檔案
 */
export async function loadPlugins() {
  const dir = __dirname; 
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (!file.startsWith('plugin-') || !file.endsWith('.js')) continue;

    try {
      const modulePath = path.join(dir, file);
      // 使用 file:// 協議確保 ESM 在 Windows/Mac 下都能正確加載
      const mod = await import(`file://${modulePath}`);
      
      if (mod.default) {
        PluginRegistry.register(mod.default);
      }
    } catch (err) {
      console.error(`[Loader] 加載插件 ${file} 失敗:`, err.message);
    }
  }
}
