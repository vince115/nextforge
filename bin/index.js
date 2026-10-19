#!/usr/bin/env node

import path from 'node:path';
import chalk from 'chalk';
import { createContext } from '../core/context.js';
import { PluginExecutor } from '../core/executor.js';
import { loadPlugins } from '../plugins/loader.js';
import { startInteractiveFlow } from '../lib/interactive.js';

async function bootstrap() {
  // 1. 引擎初始化 (自動加載插件目錄下的所有 plugin-*.js)
  await loadPlugins();

  const [command, ...args] = process.argv.slice(2);

  // 2. 交互式獲取配置 (目前僅針對 create 或預設行為)
  const projectName = (command === 'create') ? args[0] : command;

  if (!projectName || projectName === 'release') {
    if (projectName === 'release') {
      console.log('Release command currently active in legacy mode.');
    } else {
      console.log('Usage: nextforge <project-name>');
    }
    process.exit(0);
  }

  const config = await startInteractiveFlow();

  // 3. 建立執行上下文並啟動引擎
  const context = createContext({
    projectRoot: path.join(process.cwd(), projectName),
    config
  });

  let errors;
  try {
    errors = await PluginExecutor.run('create', context);
  } catch (err) {
    console.error(chalk.red(`\n❌ 建立失敗，已中止：${err.message}`));
    process.exit(1);
  }

  if (errors.length > 0) {
    console.log(chalk.yellow(`\n⚠️  專案已建立，但有 ${errors.length} 個步驟失敗：`));
    for (const e of errors) {
      console.log(chalk.yellow(`   - ${e.plugin}（${e.phase}）：${e.message}`));
    }
    console.log(chalk.yellow('   請手動補上上述步驟，或修正後重新執行。'));
    process.exit(1);
  }

  console.log(chalk.green(`\n✨ 專案 ${projectName} 建立完成！`));
  for (const note of context.state.get('notes') || []) {
    console.log(chalk.cyan(`   • ${note}`));
  }
  console.log(`\n👉 下一步：\n   cd ${projectName}\n   ${config.packageManager || 'pnpm'} run dev`);
}

bootstrap();
