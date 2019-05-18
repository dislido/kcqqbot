import * as CQNode from '@dislido/cqnode';

interface RecordType {
  [fromGroup: string]: {
    msg: string;
    userId: number;
    lastRepeat?: string;
  }
}

function shouldRepeat(record: { msg: string; userId: number; lastRepeat?: string }, event: CQNode.CQEvent.GroupMessageEvent) {
  if (record.userId === event.userId) return false;
  if (record.msg !== event.msg) return false;
  if (record.lastRepeat === event.msg) return false;
  return true;
}

export default module.exports = class Repeat extends CQNode.Module {
  record: RecordType = {}
  constructor() {
    super({
      name: '复读',
      description: '人类的本质',
      help: `两个人重复同一句话时发动
  -连续两个人说出相同的话
  -同一个人重复两次无效`,
      packageName: '@dislido/conode-module-repeat',
    });
  }

  onGroupMessage(data: CQNode.CQEvent.GroupMessageEvent, resp: CQNode.CQNodeEventResponse.GroupMessageResponse) {
    if (data.atme) {
      if (data.msg.startsWith('复读 ')) {
        resp.reply(data.msg.slice(3)).at(false);
        return true;
      }
      return false;
    }
    if (!this.record[data.groupId]) {
      this.record[data.groupId] = {
        msg: data.msg,
        userId: data.userId,
      };
    }
    const record = this.record[data.groupId];
    this.record[data.groupId] = {
      lastRepeat: data.msg,
      msg: data.msg,
      userId: data.userId,
    };
    if (shouldRepeat(record, data)) {
      return resp.at(false).reply(data.msg);
    }
    return false;
  }
};
