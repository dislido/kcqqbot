import { Module } from '@dislido/cqnode';

export  = class Repeat extends Module {
  record: {
    [fromGroup: string]: {
      list: {
        msg: string;
        userId: number;
      }[];
      lastRepeat?: string;
    }
  } = {};
  listLength: number;
  limit: number;
  /**
   * @param listLength 检查最近几条消息
   * @param limit 出现多少条重复消息时复读
   */
  constructor(listLength = 2, limit = 2) {
    super({
      name: '复读',
      description: '人类的本质',
      help: `在${listLength}条消息内，有${limit}个不同的人重复同一句话时发动复读`,
      packageName: '@dislido/cqnode-module-repeat',
    });
    
    listLength = Math.max(listLength, 2);
    limit = Math.max(limit, 2);
    if (limit > listLength) limit = listLength;
    this.listLength = listLength;
    this.limit = limit;
  }

  onGroupMessage(data: CQNode.CQEvent.GroupMessage, resp: CQNode.CQResponse.GroupMessage) {
    if (data.atme) {
      if (data.msg.startsWith('复读 ')) {
        resp.reply(data.msg.slice(3)).at(false);
        return true;
      }
      return false;
    }

    if (!this.record[data.groupId]) {
      this.record[data.groupId] = {
        list: [],
      };
    }

    const record = this.record[data.groupId];
    record.list.push({ msg: data.msg, userId: data.userId });
    if (record.list.length > this.listLength) record.list.shift();
    if (data.msg === record.lastRepeat) return false;

    const count = record.list.reduce((s, c) => {
      if (c.msg === data.msg) s.add(c.userId);
      return s;
    }, new Set()).size;

    if (count >= this.limit) {
      record.lastRepeat = data.msg;
      return resp.at(false).reply(data.msg);
    }
    return false;
  }
};
