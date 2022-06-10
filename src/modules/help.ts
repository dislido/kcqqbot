import { CQEventType, FunctionModule } from '@dislido/cqnode';

const Help: FunctionModule = mod => {
  mod.on(CQEventType.message, ctx => {
    const modulesList = ctx.cqnode.modules;
    const { textMessage } = ctx;

    if (['-help', 'help', '帮助'].includes(textMessage)) {
      return ctx.reply(`
-help / help / 帮助 // 显示此帮助信息
-module // 显示已加载的模块
-help 模块名 // 显示模块详细用法`);
    }

    if (textMessage.startsWith('-help ')) {
      const modName = textMessage.slice('-help '.length).trim();
      const modIns = modulesList.find(ins => ins.meta.name === modName);
      if (!modIns) {
        return ctx.reply(`未找到模块 ${modName} ,使用-module命令查看已加载的模块`);
      }
      return ctx.reply(modIns.meta.help || '无帮助信息');
    }

    if (textMessage === '-module') {
      let ret = '已加载的模块';
      modulesList.forEach(ins => {
        ret += `\n${ins.meta.name} ${ins.meta.description}`;
      });
      return ctx.reply(ret);
    }
    return false;
  });

  return {
    name: '帮助',
    description: '帮助信息',
    help: '-help',
    packageName: '@dislido/cqnode-module-help',
  };
};

export default Help;
