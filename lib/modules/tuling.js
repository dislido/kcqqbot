const http = require('http');
const querystring = require('querystring');
const CQNode = require('@dislido/cqnode');

module.exports = class Tuling extends CQNode.Module {
  constructor({ apikey }) {
    super();
    this.inf = {
      name: '图灵机器人',
      description: '聊天功能',
      help: '由图灵机器人API提供',
    };
    this.apikey = apikey;
  }
  onGroupMessage({ msg, atme, fromQQ }, resp) {
    if (atme) {
      // todo: 移出额外功能
      if (/ROLL *(\d+)-(\d+)/i.test(msg)) {
        const [, l, r] = /ROLL *(\d+)-(\d+)/i.exec(msg);
        resp.send(`${parseInt((Math.random() * (r - l)) + +l, 10)}`);
      } else if (/攻略/.test(msg)) {
        const mapid = /(\d-\d)/.exec(msg)[1];
        resp.send(`${mapid}攻略：https://zh.kcwiki.moe/wiki/${mapid}`);
      } else {
        http.get(`http://www.tuling123.com/openapi/api?key=${this.apikey}&info=${querystring.escape(msg)}`,
        (res) => {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            try {
              resp.send(`[CQ:at,qq=${fromQQ}] ${JSON.parse(chunk).text}`);
            } catch (e) {
              console.error('error: tuling error');
              console.error(e);
            }
          });
        }).on('error', (e) => {
          console.error(`error: problem with request: ${e}`);
          resp.send(`[CQ:at,qq=${fromQQ}] 听不懂不知道0v0`);
        });
      }
    }
    return true;
  }
};
