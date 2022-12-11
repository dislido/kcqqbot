import AsyncFunction from '../../../utils/AsyncFunction';
import { Command } from '../admin-command';


export default {
  async exec(js: string, { ctx }) {
    const console = {
      ...global.console,
    };
    const fn = new AsyncFunction('console', 'ctx', 'require', js);

    const result = await fn(console, ctx, require);
    ctx.reply(`done.\n执行结果：${result}`);
  },
  auth: 100,
  description: '运行js代码: ~$eval (代码内容)',
} as Command;
