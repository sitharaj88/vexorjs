import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue('info') + ' ' + message),
  success: (message: string) => console.log(chalk.green('✓') + ' ' + message),
  warn: (message: string) => console.log(chalk.yellow('⚠') + ' ' + message),
  error: (message: string) => console.log(chalk.red('✗') + ' ' + message),

  title: (message: string) => console.log('\n' + chalk.bold.cyan(message)),
  subtitle: (message: string) => console.log(chalk.gray(message)),

  step: (step: number, total: number, message: string) => {
    console.log(chalk.gray(`[${step}/${total}]`) + ' ' + message);
  },

  blank: () => console.log(),

  box: (message: string, options?: { title?: string; padding?: number }) => {
    const padding = options?.padding ?? 1;
    const lines = message.split('\n');
    const maxLength = Math.max(...lines.map(l => l.length), (options?.title?.length ?? 0) + 4);
    const horizontal = '─'.repeat(maxLength + padding * 2 + 2);

    console.log(chalk.cyan('┌' + horizontal + '┐'));
    if (options?.title) {
      console.log(chalk.cyan('│') + ' ' + chalk.bold(options.title.padEnd(maxLength + padding * 2)) + ' ' + chalk.cyan('│'));
      console.log(chalk.cyan('├' + horizontal + '┤'));
    }
    for (const line of lines) {
      console.log(chalk.cyan('│') + ' '.repeat(padding + 1) + line.padEnd(maxLength) + ' '.repeat(padding + 1) + chalk.cyan('│'));
    }
    console.log(chalk.cyan('└' + horizontal + '┘'));
  },

  table: (headers: string[], rows: string[][]) => {
    const colWidths = headers.map((h, i) => {
      return Math.max(h.length, ...rows.map(r => (r[i] || '').length));
    });

    const separator = colWidths.map(w => '─'.repeat(w + 2)).join('┼');
    console.log('┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐');
    console.log('│ ' + headers.map((h, i) => chalk.bold(h.padEnd(colWidths[i]))).join(' │ ') + ' │');
    console.log('├' + separator + '┤');

    for (const row of rows) {
      console.log('│ ' + row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' │ ') + ' │');
    }
    console.log('└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘');
  },

  command: (cmd: string) => console.log('  ' + chalk.gray('$') + ' ' + chalk.cyan(cmd)),

  keyValue: (key: string, value: string) => {
    console.log('  ' + chalk.gray(key + ':') + ' ' + value);
  },

  list: (items: string[]) => {
    for (const item of items) {
      console.log('  ' + chalk.gray('•') + ' ' + item);
    }
  },

  banner: (text: string) => {
    const lines = [
      '',
      chalk.cyan('╦  ╦╔═╗═╗ ╦╔═╗╦═╗'),
      chalk.cyan('╚╗╔╝║╣ ╔╩╦╝║ ║╠╦╝'),
      chalk.cyan(' ╚╝ ╚═╝╩ ╚═╚═╝╩╚═'),
      chalk.gray(text),
      '',
    ];
    lines.forEach(line => console.log(line));
  }
};

export default logger;
