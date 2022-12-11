import { CQEventType, FunctionModule } from '@dislido/cqnode';
import nodeCron, { ScheduledTask } from 'node-cron';

export interface CronExports {
  createCron(cronExpression: string, task: string): number;
  removeCron(cid: number): boolean;
}

interface CronJob {
  job: ScheduledTask;
  description?: string;
}

const Cron: FunctionModule = mod => {
  let cid = 1;
  const cronMap = new Map<number, CronJob>();
  mod.setMeta({
    name: '定时任务',
    description: '设置定时任务',
    help: `\`\`\`
cron time
(task)
\`\`\`
time:定时规则，格式参考https://baike.baidu.com/item/cron
task:任务内容，执行js代码 (可用变量: console, cqnode)
======
cron off id 关闭定时任务
cron list 查看所有定时任务
======
exports:
createCron(cronExpression: string, task: string, description?: string): number 创建定时任务, return cid
removeCron(cid: number): boolean 移除定时任务, return 是否移除成功`,
    packageName: '@dislido/cqnode-module-cron',
  });

  const saveCron = () => {
    mod.setStorage([...cronMap.entries()])
  };

  const loadCron = async () => {
    const jobs = await mod.getStorage('default', [] as Array<[number, CronJob]>)
    jobs.forEach(([cid, job]) => {
      cronMap.set(cid, job)
    })
  };
  loadCron();

  const createCron = (cronExpression: string, task: string, description?: string) => {
    while(cronMap.has(cid)) cid++;
    const fn = new Function('console', 'cqnode', task);
    const job = nodeCron.schedule(cronExpression, () => {
      fn(console, mod.cqnode);
    }, { timezone: 'Asia/Shanghai' });
    cronMap.set(cid, {
      job,
      description,
    });
    job.start();
    saveCron()
    return cid;
  };

  const removeCron = (cid: number) => {
    const task = cronMap.get(cid);
    if (!task) return false;
    task.job.stop();
    cronMap.delete(cid);
    return true;
  };

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
      const result = removeCron(offId)
      if (!result) {
        ctx.reply('不存在此任务');
        return true;
      }
      ctx.reply('已关闭任务');
      return true;
    }

    if (/cron list/.test(msg)) {
      const result = [...cronMap.entries()].map(([cid, job]) => `${cid}: ${job.description || ''}`).join('\n')
      ctx.reply(result);
      return true;
    }

    const lines = msg.split('\n');
    const cmd = lines.shift()!;
    
    let option = cmd.slice(5);
    let desc = '';
    const descReg = /-desc=(\S+)/.exec(option);
    if (descReg) {
      desc = descReg[1]
      option = option.replace(/-desc=(\S+)/, '').trim();
    }
    const task = lines.join('\n');
    const taskCid = createCron(option, task, desc)
    ctx.reply(`设置完成，定时任务id为${taskCid}，可使用cron off ${taskCid}关闭此任务`);
    return true;
  });

  

  mod.setMeta({
    exports: {
      createCron,
      removeCron,
    },
    packageName: '@dislido/cqnode-module-cron',
  })
};

export default Cron;
