const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;

module.exports = class Core extends CQNode.Module {
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
  onMessage({ atme, msg }, resp) {
    if (!atme) return false;
    if (/-help/.test(msg)) {
      const hasMod = /(\S+) *-help/.exec(msg);
      if (hasMod) {
        const modname = hasMod[1];
        const mod = this.modules.find(m => m.inf.name === modname);
        if (!mod) resp.send(`未找到模块 ${modname} ,使用-module命令查看已加载的模块`);
        else resp.send(mod.inf.help);
      } else {
        resp.send(`-help // 显示此帮助信息
-module // 显示已加载的模块
模块名 -help // 显示模块详细用法
点歌(a) // (不需@)点歌 a:歌名`);
      }
      return true;
    } else if (/-module/.test(msg)) {
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
