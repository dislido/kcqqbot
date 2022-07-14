import { Command } from '../admin-command';

export default {
  async exec(_, { ctx, userAuth, commands }) {
    ctx.reply(`~$listcmd:\n你的权限是${userAuth},可以使用的指令:\n${
      Object.keys(commands)
        .filter(cmdName => commands[cmdName].auth <= userAuth)
        .join('\n')
    }`);
  },
  auth: 0,
  description: '查看可用指令: listcmd',
} as Command;
