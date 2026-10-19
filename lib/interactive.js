import prompts from 'prompts';
import chalk from 'chalk';

/**
 * 啟動互動式問答流程
 * @returns {Promise<Object>} 返回標準化配置對象
 */
export async function startInteractiveFlow() {
  console.log(chalk.cyan('\n--- nextforge 專案初始化引導 v0.8 ---\n'));

  const questions = [
    {
      type: 'select',
      name: 'template',
      message: '請選擇您的專案模板：',
      choices: [
        { title: 'Next.js (預設)', value: 'nextjs' },
        { title: 'Admin Dashboard (後台系統)', value: 'admin' },
      ],
      initial: 0,
    },
    {
      type: 'multiselect',
      name: 'features',
      message: '要啟用哪些核心功能？',
      choices: [
        { title: 'Auth (NextAuth / JWT)', value: 'auth', selected: true },
        { title: 'Redux Toolkit (State Management)', value: 'redux', selected: false },
      ],
      instructions: false,
    },
    {
      type: 'select',
      name: 'ui',
      message: '請選擇 UI 解決方案：',
      choices: [
        { title: 'shadcn/ui (推薦)', value: 'shadcn' },
        { title: 'Tailwind CSS Only', value: 'tailwind' },
        { title: 'None (Vanilla CSS)', value: 'none' },
      ],
      initial: 0,
    },
    {
      type: 'select',
      name: 'packageManager',
      message: '使用的套件管理工具：',
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
      ],
      initial: 0,
    },
  ];

  const response = await prompts(questions, {
    onCancel: () => {
      console.log(chalk.red('\n已取消初始化。'));
      process.exit(0);
    },
  });

  return {
    template: response.template,
    features: {
      auth: response.features.includes('auth'),
      redux: response.features.includes('redux'),
    },
    ui: response.ui,
    packageManager: response.packageManager,
  };
}
