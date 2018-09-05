const CQNode = require('@dislido/cqnode');

module.exports = class Repeat extends CQNode.Module {
  constructor() {
    super();
    this.inf = {
      name: '复读',
      description: '人类的本质',
      help: `两个人重复同一句话时发动
  -连续两个人说出相同的话
  -同一个人重复两次无效`,
      multiGroupSuppot: true,
    };
    // todo: Map()
    this.record = {};
  }
  onGroupMessage({ atme, msg, fromQQ, fromGroup }, resp) {
    if (atme) return false;
    if (!this.record[fromGroup]) {
      this.record[fromGroup] = {
        msg: null,
        fromQQ: null,
        lastRepeat: null,
      };
    }
    const lastSay = this.record[fromGroup];
    if (msg
      && lastSay.msg === msg
      && lastSay.fromQQ !== fromQQ
      && lastSay.lastRepeat !== msg) {
      resp.send(msg);
      lastSay.lastRepeat = msg;
    }
    lastSay.msg = msg;
    lastSay.fromQQ = fromQQ;
    return false;
  }
};
