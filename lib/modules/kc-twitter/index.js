const path = require('path');
const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;
const tweetGetter = require('./tweet-getter');
const tweetSet = require('./tweetset');

module.exports = class KCTwitter extends CQNode.Module {
  /**
   * @param {object} config
   * @param {string?} config.imageableGroup 使用winRobot发送图片的群
   */
  constructor(config) {
    super();
    this.inf = {
      name: '官推',
      description: '官推相关信息获取',
      help: `官推 //查看官推列表
  官推.n [中文|日文] // 查看最近的第n条官推（默认中文优先）
  官推头像 //获取官推当前头像
  
  官推数据来自https://t.kcwiki.moe/`,
    };
    this.config = config;
  }
  async onGroupMessage({ atme, msg, fromGroup }, resp) {
    if (!atme) return false;
    if (/^\s*官推/.test(msg)) {
      const respMsg = await this.request(msg, fromGroup);
      if (respMsg) resp.send(respMsg);
      return true;
    }
    return false;
  }
  stop() {
    clearInterval(this.timer);
  }
  async onRun() {
    this.send = this[bindingCQNode].utils.send;
    this.radio = this[bindingCQNode].utils.radio;
    this.timer = setInterval(() => this.getTweet(), 300000);
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
          const { avatarFile, avatarUrl } = tweetSet.getAvatar();
          this.radio(`官推头像更新:${avatarUrl}\n`);
        }
      }
    } catch (err) {
      console.error('unhandled error:kc-twitter interval', err);
    }
  }
  async request(msg, fromGroup) {
    const index = /官推\.(-?\d+)/.exec(msg);
    let lang = 'zh';
    if (/日文/.exec(msg)) { lang = 'jp'; }
    if (index) {
      const i = parseInt(index[1], 10);
      if (i > 10) return '我最多只能记住10条官推';
      if (index <= 0) return 'mdzz';
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
