import chalk from 'chalk';

export const logger = {
  info: (msg) => console.log(`${chalk.blue('🚀')} ${msg}`),
  success: (msg) => console.log(`${chalk.green('✅')} ${msg}`),
  error: (msg) => console.error(`${chalk.red('❌')} ${msg}`),
  warn: (msg) => console.warn(`${chalk.yellow('⚠️')}  ${msg}`),

  step: (msg, isDryRun) => {
    const prefix = isDryRun ? chalk.bgCyan.black(' DRY RUN ') + ' ' : '';
    console.log(`${prefix}${chalk.cyan('📦')} ${msg}`);
  },

  tag: (msg, isDryRun) => {
    const prefix = isDryRun ? chalk.bgCyan.black(' DRY RUN ') + ' ' : '';
    console.log(`${prefix}${chalk.magenta('📌')} ${msg}`);
  },

  upload: (msg, isDryRun) => {
    const prefix = isDryRun ? chalk.bgCyan.black(' DRY RUN ') + ' ' : '';
    console.log(`${prefix}${chalk.blue('📤')} ${msg}`);
  },

  rollback: (msg) =>
    console.log(`${chalk.bgRed.white(' ROLLBACK ')} ${chalk.red(msg)}`),

  debug: (msg) => console.log(`${chalk.gray('🔍 [DEBUG]')} ${msg}`)
};
