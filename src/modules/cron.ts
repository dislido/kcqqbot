import { CQEventType, FunctionModule } from '@dislido/cqnode';
import nodeCron, { ScheduledTask } from 'node-cron';
import AsyncFunction from '../utils/AsyncFunction';

export interface CronExports {
  createCron(cronExpression: string, task: string): number;
  removeCron(cid: number): boolean;
}

const weekText = ['日', '一', '二', '三', '四', '五', '六']

function formatCron(cronExpression: string) {
  const list = cronExpression.replaceAll('  ', ' ').split(' ')
  let sec: string | undefined
  if (list.length === 6) sec = list.shift()
  let [minute, hour, dayOfMonth, month, dayOfWeek] = list
  if (dayOfWeek === '7') dayOfWeek = '0';
  let result = '';
  if (month !== '*') result += `${month}月`;
  else if (dayOfMonth !== '*') result += '每月';

  if (dayOfWeek !== '*') result += `每周${weekText[+dayOfWeek]}`;

  if (dayOfMonth !== '*') result += `${dayOfMonth}日`;
  else if (dayOfMonth === '*' && dayOfWeek === '*' && hour !== '*') result += '每天';

  if (hour !== '*') result += `${hour}点`;
  else if (minute !== '*') result += '每小时';

  if (minute !== '*') result += `${minute}分`;
  else if (sec && sec !== '*') result += '每分钟';

  if (sec && sec !== '*') result += `${sec}秒`;
  
  return `${result}执行`
}

interface CronJob {
  job: ScheduledTask;
  description?: string;
  cronExpression: string;
  task: string;
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
    mod.setStorage([...cronMap.entries()].map(([cid, {cronExpression, task, description}]) => [cid, {cronExpression, task, description}]))
  };

  const createCron = (cronExpression: string, task: string, description?: string) => {
    while(cronMap.has(cid)) cid++;
    const fn = new AsyncFunction('console', 'cqnode', task);
    const job = nodeCron.schedule(cronExpression, () => {
      fn(console, mod.cqnode);
    }, { timezone: 'Asia/Shanghai' });
    cronMap.set(cid, {
      job,
      description,
      cronExpression,
      task,
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
    saveCron()
    return true;
  };

  const loadCron = async () => {
    const jobs = await mod.getStorage('default', [] as Array<[number, CronJob]>);
    jobs.forEach(([cid, {cronExpression, task, description}]) => {
      const fn = new AsyncFunction('console', 'cqnode', task);
      const job = nodeCron.schedule(cronExpression, () => {
        fn(console, mod.cqnode);
      }, { timezone: 'Asia/Shanghai' });
      cronMap.set(cid, {
        job,
        description,
        cronExpression,
        task,
      });
      job.start();
    });
  };
  try {
    loadCron();
  } catch {
    // noop
  }

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
      const result = [...cronMap.entries()].map(([cid, job]) => `${cid}.${formatCron(job.cronExpression)}:${job.description || ''}`)
      if (!result.length) {
        ctx.reply('没有定时任务');
      }
      ctx.reply(result.join('\n'));
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
    ctx.reply(`设置完成，定时任务id为${taskCid}，可使用cron off ${taskCid}关闭此任务,cron: ${option}(${formatCron(option)})`);
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
