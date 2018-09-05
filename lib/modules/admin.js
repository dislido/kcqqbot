const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;

module.exports = class Admin extends CQNode.Module {
  constructor() {
    super();
    this.inf = {
      name: '管理模块',
      description: '管理员功能',
      help: `~$eval:[code] eval运行js代码
`,
    };
  }
  onRun() {
    const cqnode = this[bindingCQNode];
    this.admin = cqnode.config.admin;
    this.modules = cqnode.modules;
  }
  onMessage({ atme, msg, fromQQ }, resp) {
    if (!atme) return false;
    if (msg.startsWith('~$') && this.admin.includes(fromQQ)) {
      try {
        const result = this.command(msg.slice(2).trim());
        if (result) resp.send(result);
      } catch (e) {
        resp.send(e.message);
      }
      return true;
    }
    return false;
  }
  // todo: 需重构
  command(cmd) {
    if (cmd.startsWith('eval:')) {
      // eslint-disable-next-line no-eval
      let ret = eval(cmd.slice(5));
      if (typeof ret === 'object') ret = JSON.stringify(ret);
      return `->${ret}`;
    }

    const cmdlist = cmd.split(/\s+/);
    const exec = cmdlist.shift();
    if (!exec) { throw new Error('->'); }

    if (exec === 'unloadModule') {
      const modIndex = cmdlist.shift();
      if (!modIndex) { throw new Error('->error'); }
      if (this.modules.unloadModule(modIndex)) {
        return `->${modIndex} 已关闭`;
      }
      return `->error: ${modIndex} 关闭失败`;
    } else if (exec === 'loadModule') {
      const modIndex = cmdlist.shift();
      if (!modIndex) { throw new Error('->error'); }
      if (this.modules.loadModule(modIndex)) {
        return `->${modIndex} 已开启`;
      }
      return `->error: ${modIndex} 开启失败，模块正在运行中`;
    } else if (exec === 'commandModule') {
      const modIndex = cmdlist.shift();
      if (!modIndex) { throw new Error('->error'); }
      const mod = this.modules.modules.find(e => e.inf.name === modIndex);
      if (!mod) { throw new Error('->error'); }
      const ret = mod[cmdlist.shift()](...cmdlist);
      return `->${ret}`;
    }
    return null;
  }
};
