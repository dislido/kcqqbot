import * as CQNode from '@dislido/cqnode';
import fs from 'fs';
import path from 'path';

let packageInf: any = {};
try {
  packageInf = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString());
} catch {}

export default module.exports = class Help extends CQNode.Module {
  constructor() {
    super({
      name: '帮助',
      description: '帮助信息',
      help: '-help',
      packageName: '@dislido/cqnode-module-help',
    });
  }

  onMessage({ atme, msg }: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!atme) return false;
    const modules = this.cqnode.modules;
    if (['-help', 'help', '帮助'].includes(msg)) {
      return resp.reply(`
当前版本：${packageInf.version || 'unknown'}
-help / help / 帮助 // 显示此帮助信息
-module // 显示已加载的模块
-help 模块名 // 显示模块详细用法`);
    }

    if (msg.startsWith('-help ')) {
      const modName = msg.slice('-help '.length).trim();
      const mod = modules.find(m => m.inf.name === modName);
      if (!mod) {
        return resp.reply(`未找到模块 ${modName} ,使用-module命令查看已加载的模块`);
      }
      return resp.reply(mod.inf.help || '无帮助信息');
    }

    if (msg === '-module') {
      let ret = '已加载的模块';
      modules.forEach((e) => {
        ret += `\n${e.inf.name} ${e.inf.description}`;
      });
      return resp.reply(ret);
    }
    return false;
  }
};
