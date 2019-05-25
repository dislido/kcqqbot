import * as CQNode from '@dislido/cqnode';

export default module.exports = class Misc extends CQNode.Module {
  constructor() {
    super({
      name: '杂项功能',
      description: '小功能集合',
      help: `
(舰娘百科|舰百) (a)  返回地址：https://zh.kcwiki.org/wiki/a
roll (a)-(b) 返回[a-b]之间的随机整数
`,
      packageName: '@dislido/cqnode-module-misc',
    });
  }

  onMessage(data: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!data.atme) return false;
    if (/ROLL *(\d+)-(\d+)/i.test(data.msg)) {
      const [, l, r] = /ROLL *(\d+)-(\d+)/i.exec(data.msg) as RegExpExecArray;
      const min = +l;
      const max = +r;
      return resp.reply(`${Math.random() * (max - min + 1) + min}`);
    }
    if (/(舰娘百科|舰百)(.*)/.test(data.msg)) {
      const query = (/(舰娘百科|舰百)(.*)/.exec(data.msg) as RegExpExecArray)[2].trim();
      return resp.reply(`https://zh.kcwiki.org/wiki/${encodeURIComponent(query)}`);
    }
    return false;
  }
};
