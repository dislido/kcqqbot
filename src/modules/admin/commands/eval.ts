import { Command } from '../admin-command';

export default {
  exec(js: string, { ctx }) {
    const console = {
      ...global.console,
    };
    const fn = new Function('console', 'ctx', js);

    const result = fn(console, ctx);
    ctx.reply(`done.\n执行结果：${result}`);
  },
  auth: 100,
  description: '运行js代码: ~$eval (代码内容)',
} as Command;
