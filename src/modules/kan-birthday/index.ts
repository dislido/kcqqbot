import * as CQNode from '@dislido/cqnode';
import * as bd from './birthday-data.json';
import * as schedule from 'node-schedule';

interface BirthdayData {
  /** 舰娘名称 */
  name: string;
  /** 舰娘生日 y-m */
  birthday: string;
  /** 舰娘出生年 */
  year: string;
  /** 舰娘别名 繁简体，英文原名等 */
  aliasName: string[];
}
const birthdayData = bd as BirthdayData[];

export default module.exports = class KanBirthday extends CQNode.Module {
  notifyHour: number;
  notifyMinute: number;
  scheduleJob?: any;
  constructor({ notifyHour = 12, notifyMinute = 5 } = {}) {
    super({
      name: '舰娘生日',
      description: '舰娘生日提醒/查询',
      help: `
舰娘生日 1-1 查询1月1日生日的舰娘
舰娘生日 岛风 查询岛风的生日
`,
      packageName: '@dislido/cqnode-module-kanbirthday',
    });
    this.scheduleJob = null;
    this.notifyHour = notifyHour;
    this.notifyMinute = notifyMinute;
  }
  onRun() {
    this.scheduleJob = schedule.scheduleJob(`${this.notifyMinute} ${this.notifyHour} * * *`, () => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const data = birthdayData.filter(it => it.birthday === `${month}-${day}`);
      if (!data.length) return;
      this.bindingCQNode.api.groupRadio(`今天是${month}月${day}日，是以下舰娘的生日：\n${data.map(it => `${it.name}(${it.year})`)}`);
    });
  }
  onMessage({ atme, msg }: CQNode.CQEvent.MessageEvent, resp: CQNode.CQNodeEventResponse.MessageResponse) {
    if (!atme) return false;
    if (/舰娘生日\s+\S+$/.test(msg)) {
      const query = msg.slice(4).trim();
      const type = /\d+-\d+/.test(query) ? 'date' : 'name';
      if (type === 'date') {
        const result = birthdayData
          .filter(it => it.birthday === query)
          .map(it => `${it.name}(${it.year})`);
        if (!result.length) {
          resp.send(`没有在${query}出生的舰娘`);
          return true;
        }
        resp.send(`在${query}出生的舰娘有：\n${result.join('\n')}`);
        return true;
      }
      const result = birthdayData
        .filter(it => it.name.includes(query) || it.aliasName.find(name => name.includes(query)))
        .map(it => `${it.name}:${it.year}-${it.birthday}`);
      if (!result.length) {
        resp.send('没有找到该舰娘\n a.游戏未实装\n b.插件数据未更新\n c.名称错误，尝试改变繁简体或只输入一个字来查询');
        return true;
      }
      resp.send(`查询'${query}'生日结果：\n${result.join('\n')}`);
      return true;
    }
    return false;
  }
  onStop() {
    this.scheduleJob.cancel();
  }
};
