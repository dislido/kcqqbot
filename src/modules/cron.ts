import { CQEventType, FunctionModule } from '@dislido/cqnode';
import nodeCron, { ScheduledTask } from 'node-cron';

const Cron: FunctionModule = mod => {
  let cid = 1;
  const cronMap = new Map<number, ScheduledTask>();

  mod.on(CQEventType.message, ctx => {
    const msg = ctx.textMessage;
    if (!msg.startsWith('cron ')) return false;
    if (!ctx.cqnode.config.admin?.includes(ctx.event.sender.user_id)) {
      ctx.reply('权限不足，无法使用此功能');
      return true;
    }

    if (/cron off (\d)+/.test(msg)) {
      const offIdMatch = /cron off (?<offId>\d+)/.exec(msg)!;
      const offId = +offIdMatch.groups!.offId;
      if (!cronMap.has(offId)) {
        ctx.reply('不存在此任务');
        return true;
      }
      const task = cronMap.get(offId)!;
      task.stop();
      cronMap.delete(offId);
      ctx.reply('已关闭任务');
      return true;
    }

    const lines = msg.split('\n');
    const cmd = lines.shift()!;
    let option = cmd.slice(5);
    const isJs = option.includes('-js');
    if (isJs) option = option.replace(/-js/g, '').trim();
    const task = lines.join('\n');
    const job = nodeCron.schedule(option, () => {
      if (isJs) {
        const fn = new Function('console', 'ctx', task);
        fn(console, ctx);
        return;
      }
      ctx.reply(task);
    }, { timezone: 'Asia/Shanghai' });
    cronMap.set(cid, job);
    job.start();
    ctx.reply(`设置完成，定时任务id为${cid}，可使用cron off ${cid}关闭此任务`);
    cid++;
    return true;
  });

  return {
    name: '定时任务',
    description: '设置定时任务',
    help: `cron time [-js]
(task)
------
time:定时规则，格式参考https://baike.baidu.com/item/cron
task:任务内容，默认为发送消息，启用-js选项时为执行代码
======
cron off id
------
关闭定时任务`,
    packageName: '@dislido/cqnode-module-cron',
  };
};

export default Cron;
