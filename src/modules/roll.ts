import { CQEventType, FunctionModule } from '@dislido/cqnode';

const Roll: FunctionModule = mod => {
  mod.on(CQEventType.message, ctx => {
    if (/ROLL *(\d+)-(\d+)/i.test(ctx.event.raw_message)) {
      const [, l, r] = /ROLL *(\d+)-(\d+)/i.exec(ctx.event.raw_message) as RegExpExecArray;
      const min = +l;
      const max = +r;
      ctx.reply(`${Math.floor(Math.random() * (max - min + 1) + min)}`, true);
      return true;
    }
    return false;
  }, { atme: true });

  return {
    name: 'roll点',
    description: '生成随机数',
    help: 'roll a-b 返回[a-b]之间的随机整数',
    packageName: '@dislido/cqnode-module-roll',
  };
};

export default Roll;
