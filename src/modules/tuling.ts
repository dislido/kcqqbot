import * as http from 'http';
import * as querystring from 'querystring';
import * as CQNode from '@dislido/cqnode';

export  = class Tuling extends CQNode.Module {
  constructor(public apikey: string) {
    super({
      name: '图灵机器人',
      description: '聊天功能',
      help: '由图灵机器人API提供',
      packageName: '@dislido/cqnode-module-tuling',
    });
  }

  async onMessage(data: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!data.atme) return false;
    const msg = querystring.escape(data.msg);
    if (msg.length > 8000) return resp.reply('消息太长了，图灵机器人无法处理');
    const reply: string = await new Promise(resolve => http.get(
      `http://www.tuling123.com/openapi/api?key=${this.apikey}&info=${msg}`,
      (res) => {
        res
        .setEncoding('utf8')
        .on('data', (chunk) => {
          try {
            resolve(`${JSON.parse(chunk).text}`);
          } catch (e) {
            console.error('CQNode Module Error: tuling error: ', e, chunk);
          }
        });
      },
    ).on('error', (e) => {
      console.error(`[error]CQNode Tuling Error: ${e}`);
    }));
    return resp.reply(reply);
  }
};
