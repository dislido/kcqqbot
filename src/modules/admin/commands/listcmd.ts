import { Command } from "../admin-command";

export default {
  async exec(_, { msgData, resp }) {
    const userAuth = await this.getUserAuth(msgData.userId);
    resp.reply(`~$listcmd:\n你的权限是${userAuth},可以使用的指令:\n${
      Object.keys(this.commands)
        .filter(cmdName => this.commands[cmdName].auth <= userAuth)
        .join('\n')
    }`);
  },
  auth: 0,
  description: '查看可用指令: ~$listcmd',
} as Command;
