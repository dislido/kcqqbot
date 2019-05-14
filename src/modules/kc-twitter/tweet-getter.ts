import * as http from 'http';

const getSync = (url: string) => new Promise<string>((resolve, reject) => {
  let ret = '';
  http.get(url, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      ret += chunk;
    }).on('end', () => resolve(ret));
  }).on('error', reject);
});

/**
 * 获取最近的10条官推
 * @returns {Array} 官推列表
 */
export async function getTweet() {
  let data;
  try {
    data = await getSync('http://api.kcwiki.moe/tweet/html/10');
    if (data.startsWith('<')) return null;
    const tweet = JSON.parse(data);
    if (!Array.isArray(tweet)) {
      console.error('[debug]tweet-getter.getTweet: tweet is not a Array:', tweet);
      return null;
    }
    return tweet as TweetData[];
  } catch (e) {
    if (e.name === 'SyntaxError') {
      console.error(`[error]${new Date()} unhandled tweet-getter.getTweet:`, e, data);
    } else if (e.code === 'ETIMEDOUT') {
      // console.error(`error: TweetGetter.getTweet ETIMEDOUT ${new Date()}`);
    } else if (e.code === 'EAI_AGAIN') {
      console.error(`[error] TweetGetter.getTweet EAI_AGAIN ${new Date()}`);
    } else {
      console.error(`[error]${new Date()} unhandled tweet-getter.getTweet:`, e, data);
    }
  }
  return null;
}

/**
 * 获取官推头像
 * @returns {string} 官推头像地址
 */
export async function getAvatar() {
  let data;
  try {
    data = await getSync('http://api.kcwiki.moe/avatar/latest');
    const latest = JSON.parse(data).latest;
    if (typeof latest === 'string') {
      return latest.replace(/^http:/, 'https:')
        .replace(/moe/, 'org');
    }
  } catch (e) {
    if (e.code === 'ETIMEDOUT' || e.code === 'ECONNRESET') {
      // do nothing
    } else if (e.name === 'SyntaxError') {
      if (!e.message.startsWith('Unexpected token <')) {
        console.error(`[error]TweetGetter.getAvatar: parse tweet page failed ${new Date()}-`, e);
        console.log('[debug]data:', data);
      }
    } else if (e.code === 'EAI_AGAIN') {
      console.error(`[error] TweetGetter.getAvatar EAI_AGAIN ${new Date()}`);
    } else {
      console.error(`[error]${new Date()} unhandled tweet-getter.getAvatar:`, e);
    }
  }
  return null;
}
export default {
  getTweet,
  getAvatar,
};
