import * as http from 'http';
import * as querystring from 'querystring';
import * as CQNode from '@dislido/cqnode';

export default module.exports = class Tuling extends CQNode.Module {
  apikey: string;
  constructor({ apikey }: { apikey: string }) {
    super({
      name: '图灵机器人',
      description: '聊天功能',
      help: '由图灵机器人API提供',
      packageName: '@dislido/cqnode-module-tuling',
    });
    this.apikey = apikey;
  }

  async onMessage(data: CQNode.CQEvent.MessageEvent, resp: CQNode.CQNodeEventResponse.MessageResponse) {
    if (!data.atme) return false;
    const reply: string = await new Promise(resolve => http.get(
      `http://www.tuling123.com/openapi/api?key=${this.apikey}&info=${querystring.escape(data.msg)}`,
      (res) => {
        res.setEncoding('utf8').on('data', (chunk) => {
          try {
            resolve(`${JSON.parse(chunk).text}`);
          } catch (e) {
            console.error('CQNode Module Error: tuling error: ', e);
          }
        });
      },
    ).on('error', (e) => {
      console.error(`error: problem with request: ${e}`);
      resolve(`听不懂不知道0v0`);
    }));
    return resp.reply(reply);
  }
};
