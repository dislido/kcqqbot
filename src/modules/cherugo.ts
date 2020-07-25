import CQNode from '@dislido/cqnode';

enum CheruSet { '切','卟','叮','咧','哔','唎','啪','啰','啵','嘭','噜','噼','巴','拉','蹦','铃' }

function isCheruru(chars: string[]): chars is Array<keyof typeof CheruSet> {
  return chars[0] === '切' && chars.every(c => Number.isNaN(+c) && c in CheruSet);
}

export = class Cherugo extends CQNode.Module {
  constructor() {
    super({
      name: '切噜语翻译',
      description: '切噜语翻译，移植自github:Ice-Cirno/HoshinoBot/hoshino/modules/priconne/cherugo.py ',
      help: `- 转换为切噜语:
切噜噜 ...

- 切噜语翻译
切噜! ...
`,
      packageName: '@dislido/cqnode-module-cherugo',
    });
  }

  onMessage(data: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!data.atme) return false;
    if (data.msg.startsWith('切噜噜')) {
      const buf = [...Buffer.from(data.msg.slice(3).trim())];
      const result = buf.map(val => `${CheruSet[val >>> 4]}${CheruSet[val & 15]}`).join('');
      return resp.reply(`切${result}`);
    }
    if (data.msg.startsWith('切噜!') || data.msg.startsWith('切噜！')) {
      const chars = [...data.msg.slice(3).trim()];

      if (!isCheruru(chars)) {
        return resp.reply('这不是切噜语！');
      }
      chars.shift();
      const ui8arr = Buffer.from(chars.map((c) => CheruSet[c])).reduce((val, byte, index) => {
        index & 1 ? val[Math.floor(index / 2)] += byte : val.push(byte << 4);
        return val;
      }, [] as number[]);
      Buffer.from(ui8arr).toString();
      return resp.reply(`的切噜噜是：\n${Buffer.from(ui8arr).toString()}`);
    }
    return false;
  }
};
