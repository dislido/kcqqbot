/**
 * 杂项功能
 */
const CQNode = require('@dislido/cqnode');

const startMap = {
  舰娘百科(msgstr) {

  },
  roll() {

  },
};

startMap.舰百 = startMap.舰娘百科;

module.exports = class Misc extends CQNode.Module {
  constructor() {
    super();
    this.inf = {
      name: '杂项功能',
      description: '小功能集合',
      help: `
(舰娘百科|舰百) (a)  返回地址：https://zh.kcwiki.org/wiki/a
roll (a)-(b) 返回[a-b]之间的随机整数
`,
    };
  }
  onMessage({ atme, msg }, resp) {
    if (!atme) return false;
    if (/ROLL *(\d+)-(\d+)/i.test(msg)) {
      const [, l, r] = /ROLL *(\d+)-(\d+)/i.exec(msg);
      resp.send(`${parseInt((Math.random() * (r - l)) + +l + 1, 10)}`);
      return true;
    }
    if (/(舰娘百科|舰百)(.*)/.test(msg)) {
      const query = /(舰娘百科|舰百)(.*)/.exec(msg)[2].trim();
      resp.send(`https://zh.kcwiki.org/wiki/${encodeURIComponent(query)}`);
      return true;
    }
    return false;
  }
};
