/**
 * 记录一个舰娘的生日信息
 * @typedef {Object} BirthdayData
 * @property {string} name - 舰娘名称
 * @property {string} birthday - 舰娘生日
 * @property {string} year - 舰娘出生年
 * @property {string[]} aliasName - 舰娘别名 繁简体，英文原名等
 */
 /**
 * @type {BirthdayData[]}
 */
const birthdayData = require('./birthday-data.json');
const schedule = require('node-schedule');
const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;

module.exports = class KanBirthday extends CQNode.Module {
  constructor({ notifyHour = 12, notifyMinute = 5 } = {}) {
    super();
    this.scheduleJob = null;
    this.inf = {
      name: '舰娘生日提醒',
      description: '',
      help: `生日提醒模块
命令：无
服务：
舰娘生日 1-1 查询1月1日生日的舰娘
舰娘生日 岛风 查询岛风的生日
`,
    };
    this.notifyHour = notifyHour;
    this.notifyMinute = notifyMinute;
  }
  onRun() {
    if (!this.sendGroups) this.sendGroups = this[bindingCQNode].config.listenGroups;
    this.scheduleJob = schedule.scheduleJob(`${this.notifyMinute} ${this.notifyHour} * * *`, () => {
      const date = new Date();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const data = birthdayData[`${month}-${day}`];
      if (!data) return;
      this[bindingCQNode].utils.radio(`今天是${month}月${day}日，是以下舰娘的生日：
${data}`, this.sendGroups);
    });
  }
  onMessage({ atme, msg }, resp) {
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
        resp.send('没有找到该舰娘 a.游戏未实装 b.插件数据未更新 c.名称错误，尝试改变繁简体或只输入一个字来查询');
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
