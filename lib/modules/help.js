const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;

module.exports = class Help extends CQNode.Module {
  constructor() {
    super();
    this.inf = {
      name: '帮助',
      description: '帮助信息',
      help: '-help',
    };
  }
  onRun() {
    this.modules = this[bindingCQNode].modules;
  }
  findModule(modName) {
    return this.modules.find(m => m.inf.name === modName);
  }
  onMessage({ atme, msg }, resp) {
    if (!atme) return false;
    if (['-help', 'help', '帮助'].includes(msg)) {
      resp.send(`-help / help / 帮助 // 显示此帮助信息
-module // 显示已加载的模块
-help 模块名 // 显示模块详细用法
点歌(a) // (不需@)点歌 a:歌名`);
      return true;
    }

    if (msg.startsWith('-help ')) {
      const modName = msg.slice('-help '.length).trim();
      const mod = this.findModule(modName);
      if (!mod) {
        resp.send(`未找到模块 ${modName} ,使用-module命令查看已加载的模块`);
      } else {
        resp.send(mod.inf.help);
      }
      return true;
    }

    if (msg === '-module') {
      let ret = '已加载的模块';
      this.modules.filter(it => !it.inf.hidden).forEach((e) => {
        ret += `\n${e.inf.name} ${e.inf.description}`;
      });
      resp.send(ret);
      return true;
    }
    return false;
  }
};
