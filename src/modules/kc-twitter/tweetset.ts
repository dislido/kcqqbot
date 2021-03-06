import labelParser from './labelparser';
import getImg from './getimg';

let filePath: string;

/**
 * 将HTML格式推特转为字符串
 * @param tweet 推特HTML内容
 * @returns {string} innerText
 */
function parseTweetHTML(tweet: string) {
  let pl = tweet.replace(/<br *\/>/g, '\n')
    .replace(/&#038;/g, '&')
    .replace(/<\/?a[^>]*>/g, '')
    .replace(/<\/?span[^>]*>/g, '')
    .replace(/<img +src="([^"]*)"[^>]*\/>/g, '[图片$1]')
    .replace(/https:\/\/pbs.twimg.com\//g, 'https://cdn.kcwiki.moe/t-img/')
    .replace(/[\r\n]/g, ' ');

  const img = /<span[^<]*<a href="([^"]*)"[^>]*>.*<\/span>/.exec(pl);
  if (img && img[1]) {
    pl = pl.replace(/<span[^>]*>([^<]*).*<\/span>/, '$1') + img[1];
  }
  return `${pl}`;
}

const maxCount = 10; // 最大保存官推数量

/**
 * @typedef Tweet
 * @param {number} id
 * @param {string?} zh
 * @param {string} jp
 * @param {string} date yyyy-MM-dd hh:mm:ss
 *
 * @param {string} collapse
 * @param {string} labels
 */

const tweetList = {
  list: [] as TweetData[],
  /**
   * 更新推特数据
   * @param {object} tweet 原始数据对象
   * @returns {boolean} 是否是新官推
   */
  update(tweet: TweetData) {
    // bugfix: 偶尔会出现更新旧编号推特（超过最大储存推特数）的情况，在这里直接跳过
    // this.list[maxCount - 1]?.id > tweet.id
    if (this.list[maxCount - 1] && this.list[maxCount - 1].id > tweet.id) {
      return false;
    }

    const t = this.list.find(it => it.id === tweet.id);
    let isNewTweet = false;
    if (!t) {
      isNewTweet = true;
      const newTweet = tweet;
      newTweet.jp = `${parseTweetHTML(newTweet.jp)}\n${newTweet.date}`;
      if (newTweet.zh) newTweet.zh = `${parseTweetHTML(newTweet.zh)}\n${newTweet.date}`;

      newTweet.labels = labelParser(newTweet.jp);
      newTweet.collapse = (newTweet.zh || newTweet.jp).slice(0, 20);

      this.list.push(newTweet);
      this.list.sort((a, b) => b.id - a.id);
      this.list.splice(maxCount);
    } else if (!t.zh && tweet.zh) {
      t.zh = `${parseTweetHTML(tweet.zh)}\n${tweet.date}`;
      t.collapse = t.zh.slice(0, 20);
    }
    return isNewTweet;
  },
  getAll() { return this.list; },
  getByIndex(index: number) { return this.list[index]; },
  getById(id: number) {
    // debug
    const twi = this.list.find(it => it.id === id);
    if (!twi) {
      console.error(`[debug]KCTwitter.tweetset: find ${id} in`, this.list);
    }
    return twi;
  },
};

/**
 * 更新推特列表
 * @param tweets 原始数据对象数组
 * @returns 新官推对象数组
 */
function update(tweets: TweetData[]) {
  const inited = tweetList.list.length !== 0;
  const newTweets = tweets.filter(it => tweetList.update(it));
  if (!inited) { return []; }
  return newTweets.map(it => it.id)
    .map(it => tweetList.getById(it)) as TweetData[];
}

let avatarUrl = '';
let avatarFile = '';

/**
 * 更新官推头像地址并下载头像图片，如果是新头像则返回头像信息
 * - avatarFile 本地文件路径
 * - avatarUrl 头像地址（=url）
 * @param {string} url 官推头像地址
 */
async function updateAvatar(url: string) {
  const isInit = !avatarUrl;
  if (url === avatarUrl || !url) return null;
  avatarUrl = url;
  avatarFile = await getImg(url, undefined, filePath);
  if (isInit) return null;
  return {
    avatarFile,
    avatarUrl,
  };
}

function getAvatar() {
  return {
    avatarFile,
    avatarUrl,
  };
}

export default {
  update,
  getAll() {
    return tweetList.list;
  },
  getIndex(index: number) {
    return tweetList.getByIndex(index);
  },
  updateAvatar,
  getAvatar,
  setFilePath(path: string) { filePath = path; },
};
