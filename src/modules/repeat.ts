import { CQEventType, FunctionModule, util } from '@dislido/cqnode';
import type { AtElem, ImageElem, TextElem } from 'oicq';

interface RepeatConfig {
  listLength?: number;
  limit?: number;
}

/** qq图片cdn会携带qq号导致图片相等判断错误，替换掉对应内容 */
function parseQpicUrl(url: string) {
  return url.replace(/\/gchatpic_new\/(\d+)\/(\d+)-(\d+)/, '/gchatpic_new/0/0-0');
}

type repeatableMsgType = keyof typeof parseRepeatMsg;
const parseRepeatMsg = {
  text: (msg: TextElem) => msg.text,
  image: (msg: ImageElem) => msg.url ? util.segment.image(parseQpicUrl(msg.url)) : '',
  at: (msg: AtElem) => util.segment.at(msg.qq),
};

const Repeat: FunctionModule = (mod, config: RepeatConfig = {}) => {
  const records: {
    [fromGroup: string]: {
      list: {
        msg: string;
        userId: number;
      }[];
      lastRepeat?: string;
    }
  } = {};

  const listLength = Math.max(config.listLength || 2, 2);
  let limit = Math.max(config.limit || 2, 2);
  if (limit > listLength) limit = listLength;

  mod.setMeta({
    name: '复读',
    description: '人类的本质',
    help: `在${listLength}条消息内，有${limit}个不同的人重复同一句话时发动复读`,
    packageName: '@dislido/cqnode-module-repeat',
  });

  mod.on(CQEventType.messageGroup, ctx => {
    if (!records[ctx.event.group_id]) {
      records[ctx.event.group_id] = {
        list: [],
      };
    }
    const isRepeatableMsg = ctx.event.message.every(it => it.type in parseRepeatMsg);
    if (!isRepeatableMsg) return false;

    const repeatMsg = ctx.event.message.map(it => parseRepeatMsg[it.type as repeatableMsgType](it as any));
    const repeatMessageJson = JSON.stringify(repeatMsg);

    const record = records[ctx.event.group_id];
    record.list.push({ msg: repeatMessageJson, userId: ctx.event.sender.user_id });
    if (record.list.length > listLength) record.list.shift();
    if (repeatMessageJson === record.lastRepeat) return false;

    const count = record.list.reduce((s, c) => {
      if (c.msg === repeatMessageJson) s.add(c.userId);
      return s;
    }, new Set()).size;

    if (count >= limit) {
      record.lastRepeat = repeatMessageJson;
      ctx.reply(repeatMsg);
      return true;
    }
    return false;
  }, { atme: false });
};

export default Repeat;
