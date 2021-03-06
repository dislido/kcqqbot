import * as path from 'path';
import * as fs from 'fs';
import * as CQNode from '@dislido/cqnode';
import tweetGetter from './tweet-getter';
import tweetSet from './tweetset';

/**
 获取官推间隔
 */
const GET_TWEET_INTERVAL = 5 * 60 * 1000;

module.exports = class KCTwitter extends CQNode.Module {
  radio: (msg: string) => void;
  timer: NodeJS.Timeout;
  constructor() {
    super({
      name: '官推',
      description: '官推相关信息获取',
      help: `官推 //查看官推列表
官推.n [中文|日文] // 查看最近的第n条官推（默认中文优先）
官推头像 //获取官推当前头像

官推数据来自https://t.kcwiki.moe/`,
      packageName: '@dislido/kctwitter',
    });
  }

  async onMessage({ atme, msg }: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!atme) return false;
    if (/^\s*官推/.test(msg)) {
      return resp.reply(await this.request(msg));
    }
    return false;
  }

  stop() {
    clearInterval(this.timer);
  }

  async onRun() {
    const fpath = await this.getFilepath();
    const imgPath = path.resolve(fpath, 'img');
    if (!fs.existsSync(imgPath)) {
      fs.mkdirSync(imgPath);
    }
    tweetSet.setFilePath(imgPath);
    this.radio = (msg: string) => this.cqnode.inf.groupList.forEach(group => {
      this.cqnode.api.sendGroupMsg(group.group_id, msg);
    });
    this.timer = setInterval(() => this.getTweet(), GET_TWEET_INTERVAL);
    this.getTweet();
  }

  async getTweet() {
    try {
      const tweet = await tweetGetter.getTweet();
      if (tweet) {
        const newTweet = tweetSet.update(tweet);
        if (newTweet.length > 0) {
          if (newTweet.length <= 2) {
            const list = newTweet.map(twi => twi.zh || twi.jp)
              .join('\n');
            this.radio(`${newTweet.length}条新官推：\n${list}`);
          } else {
            const list = newTweet.map((twi, index) => `${twi.labels}${index + 1}.${(twi.zh || twi.jp).slice(0, 20)}`)
              .join('\n');
            this.radio(`${newTweet.length}条新官推：\n${list}\n多条官推已折叠，使用'官推.n'命令查看第n条官推`);
          }
        }
      }
      const avatar = await tweetGetter.getAvatar();
      if (avatar) {
        const newAvatar = await tweetSet.updateAvatar(avatar);
        if (newAvatar) {
          const { avatarUrl } = tweetSet.getAvatar();
          this.radio(`官推头像更新:${avatarUrl}\n`);
        }
      }
    } catch (err) {
      console.error('unhandled error:kc-twitter interval', err);
    }
  }

  async request(msg: string) {
    const index = /官推\.(-?\d+)/.exec(msg);
    let lang: 'zh' | 'jp' = 'zh';
    if (/日文|语/.exec(msg)) { lang = 'jp'; }
    if (index) {
      const i = parseInt(index[1], 10);
      if (i > 10) return '我最多只能记住10条官推';
      if (i <= 0) return 'mdzz';
      const twi = tweetSet.getIndex(i - 1);
      if (!twi) {
        return `未获取到第${i}条官推，使用'官推'命令查看当前已获取的官推列表`;
      }
      return twi[lang] || twi.jp;
    } else if (/头像/.exec(msg)) {
      const { avatarFile, avatarUrl } = tweetSet.getAvatar();
      if (!avatarUrl || !avatarFile) {
        return '暂未获取到头像，请稍后再试';
      }
      return `官推当前头像:${avatarUrl}`;
    }
    const twiSet = tweetSet.getAll();
    if (!twiSet || !twiSet.length) {
      return '暂未获取到官推，请稍后再试';
    }
    const tweet = twiSet.map((twi, i) => `${twi.labels}${i + 1}.${(twi.zh || twi.jp).slice(0, 20)}`).join('\n');
    return `已获取的官推：\n${tweet}
  使用'官推.n'命令查看第n条官推详情`;
  }
};
