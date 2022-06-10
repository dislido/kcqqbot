import { CQEventType, FunctionModule, util } from '@dislido/cqnode';
import axios from 'axios';
import type { Sendable } from 'oicq';

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
  mod.on(CQEventType.message, async ctx => {
    const regExec = /(?<tagQuery>.*)色图/.exec(ctx.textMessage);
    if (!regExec) return false;
    const { tagQuery = '' } = regExec.groups!;
    const tag = tagQuery.split('&').map(it => it.split('|').slice(0, 10)).slice(0, 3);

    const params: SetuParams = {
      tag,
      size: 'regular',
    };

    try {
      const resp = await axios.post<SetuData>('https://api.lolicon.app/setu/v2', params, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      const { data, error } = resp.data;
      const replyList: Sendable = [];
      if (!data?.length) throw error;
      data.forEach(it => {
        replyList.push(`(${it.pid})${it.title} by ${it.author}`);
        replyList.push(util.segment.image(it.urls.regular));
      });
      ctx.reply(replyList);
      return true;
    } catch (e) {
      ctx.reply(`获取失败：${e.message}`);
      return true;
    }
  });

  return {
    packageName: '@dislido/cqnode-module-setu',
    name: '随机色图',
    description: '获取随机色图 - https://api.lolicon.app/#/setu',
    help: '色图 - 获取色图； xx色图 - 获取xx tag下的色图，支持&和｜来取且或',
  };
};

export default Setu;
