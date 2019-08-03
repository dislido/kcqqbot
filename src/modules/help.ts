import * as CQNode from '@dislido/cqnode';

export default module.exports = class Help extends CQNode.Module {
  constructor() {
    super({
      name: '帮助',
      description: '帮助信息',
      help: '-help',
      packageName: '@dislido/cqnode-module-help',
    });
  }

  findModule(modName: string) {
    return this.cqnode.modules.find(m => m.inf.name === modName);
  }

  onMessage({ atme, msg }: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!atme) return false;
    if (['-help', 'help', '帮助'].includes(msg)) {
      return resp.send(`-help / help / 帮助 // 显示此帮助信息
-module // 显示已加载的模块
-help 模块名 // 显示模块详细用法
点歌(a) // (不需@)点歌 a:歌名`);
    }

    if (msg.startsWith('-help ')) {
      const modName = msg.slice('-help '.length).trim();
      const mod = this.findModule(modName);
      if (!mod) {
        return resp.send(`未找到模块 ${modName} ,使用-module命令查看已加载的模块`);
      }
      return resp.send(mod.inf.help);
    }

    if (msg === '-module') {
      let ret = '已加载的模块';
      this.cqnode.modules.forEach((e) => {
        ret += `\n${e.inf.name} ${e.inf.description}`;
      });
      return resp.send(ret);
    }
    return false;
  }
};
