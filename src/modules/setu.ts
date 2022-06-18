import { CQEventType, FunctionModule, util } from '@dislido/cqnode';
import axios from 'axios';

enum R18Option {
  Safe = 0,
  R18 = 1,
  All = 2,
}

interface SetuParams {
  r18?: R18Option;
  /** 一次返回的结果数量，范围为1到100；在指定关键字或标签的情况下，结果数量可能会不足指定的数量 */
  num?: number;
  /** 返回匹配指定标签的作品 */
  tag?: string[] | string[][];
  /** 返回在这个时间及以后上传的作品；时间戳，单位为毫秒 */
  dateAfter?: number;
  size?: string;
}

interface SetuData {
  error: string;
  data: Array<{
    pid: number;
    p: number;
    uid: number;
    title: string;
    author: string;
    r18: boolean;
    width: number;
    height: number;
    tags: string[];
    ext: string;
    uploadDate: number;
    urls: {
      regular: string;
    }
  }>;
}

const Setu: FunctionModule = mod => {
  mod.setMeta({
    packageName: '@dislido/cqnode-module-setu',
    name: '随机色图',
    description: '获取随机色图 - https://api.lolicon.app/#/setu',
    help: '色图 - 获取色图； xx色图 - 获取xx tag下的色图，支持&和｜来取且或',
  });

  mod.on(CQEventType.message, async ctx => {
    const regExec = /(?<tagQuery>.*)色图/.exec(ctx.textMessage);
    if (!regExec) return false;
    const { tagQuery = '' } = regExec.groups!;
    const tag = tagQuery ? tagQuery.split('&').map(it => it.split('|').slice(0, 10)).slice(0, 3) : [];

    const params: SetuParams = {
      size: 'regular',
    };
    if (tag.length) {
      params.tag = tag;
    }
    const reqUrl = `https://api.lolicon.app/setu/v2?${new URLSearchParams(params as Record<string, string>)}`;
    try {
      const resp = await axios.get<SetuData>(reqUrl, { timeout: 10000 });
      const { data, error } = resp.data;
      if (!data?.length) throw new Error(error || '未找到相关色图');
      const imgList = data.map(it => ({
        text: `(${it.pid})${it.title} by ${it.author}`,
        img: it.urls.regular.replace('i.pixiv.cat', 'i.pixiv.re'),
        buf: null,
      }));
      await Promise.all(imgList.map(it => axios.get(it.img, {
        responseType: 'arraybuffer',
        timeout: 15000,
      }).then(imgRes => { it.buf = imgRes.data; }).catch(() => true)));
      if (ctx.event.message_type === 'group') {
        const availableImg = imgList.filter(it => it.buf);
        await ctx.event.group.uploadImages(availableImg.map(it => util.segment.image(it.buf!)));
        ctx.reply(availableImg.map(it => [it.text, util.segment.image(it.buf!)]).flat());
        return true;
      }
      ctx.reply('ok');
      return true;
    } catch (e) {
      ctx.reply(`获取失败：${e.message}`);
      return true;
    }
  });
};

export default Setu;
