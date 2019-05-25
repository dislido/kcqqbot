import * as schedule from 'node-schedule';
import * as CQNode from '@dislido/cqnode';

/**
 * 返回指定秒数后的Date对象
 * @param {number|string} sec 秒数
 * @returns {Date}
 */
function afterSecond(sec: number | string) {
  return new Date((+sec * 1000) + Date.now());
}

export default module.exports = class Notify extends CQNode.Module {
  notifySet: Set<schedule.Job> = new Set();
  constructor() {
    super({
      name: '定时提醒',
      description: '设置定时提醒',
      help: `(a)秒后提醒 (b) //a:定时秒数; b:提醒内容;
  (a)时提醒 (b) //a:定时时间 格式：任何可用于构造js Date对象的字符串 如2017/01/01 15:00:00 ;b:提醒内容;
  错误的时间或超过2147483647毫秒（约24天）的提醒设置无效并立刻输出`,
      packageName: '@dislido/cqnode-module-notify',
    });
  }
  onStop() {
    this.notifySet.forEach(e => e.cancel());
    this.notifySet.clear();
  }
  onMessage({ atme, msg, userId }: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!atme) return false;

    if (this.bySecond({ msg, userId }, resp)) return true;
    if (this.byDate({ msg, userId }, resp)) return true;

    return false;
  }
  bySecond({ msg, userId }: { msg: string, userId: number }, resp: CQNode.CQResponse.Message) {
    const regret = /(\d+)秒后提醒(.+)/.exec(msg);
    if (!regret) return false;
    const time = afterSecond(regret[1]);
    const str = regret[2];
    this.addNotify(time, () => resp.send(`[CQ:at,qq=${userId}]设置的提醒：
  ${str}`));
    resp.send(`[CQ:at,qq=${userId}]提醒设置完毕`);
    return true;
  }
  byDate({ msg, userId }: { msg: string, userId: number }, resp: CQNode.CQResponse.Message) {
    const regret = /^(.*)时提醒\s(.*)/.exec(msg);
    if (!regret) return false;
    const [, time, str] = regret;
    const totime = new Date(time);
    if (totime.toString() === 'Invalid Date') {
      resp.send(`[CQ:at,qq=${userId}]日期格式错误`);
      return true;
    }
    this.addNotify(totime, () => resp.send(`[CQ:at,qq=${userId}]设置的提醒：
  ${str}`));
    resp.send(`[CQ:at,qq=${userId}]提醒设置完毕`);
    return true;
  }
  addNotify(time: Date, task: () => any) {
    if (!(time instanceof Date)) return;
    if (time.getTime() <= Date.now()) {
      task();
      return;
    }
    const job = schedule.scheduleJob(time, () => {
      task();
      this.notifySet.delete(job);
    });
    this.notifySet.add(job);
  }
};
