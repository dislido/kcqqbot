import http from 'http';
import { CQEventType, FunctionModule } from '@dislido/cqnode';

/**
 * 图灵机器人API响应
 * https://www.kancloud.cn/turing/www-tuling123-com/718227
 */
interface TulingResponse {
  intent: {
    code: number;
    intentName: string;
    actionName: string;
    parameters?: Record<string, string>;
  },
  results: Array<{
    groupType: number;
    resultType: string;
    values: Record<string, string>;
  }>;
}
const Tuling: FunctionModule = (mod, apiKey) => {
  mod.setMeta({
    name: '图灵机器人',
    description: '聊天功能',
    help: '由图灵机器人API提供',
    packageName: '@dislido/cqnode-module-tuling',
  });

  mod.on(CQEventType.message, async ctx => {
    if (!ctx.atme) return false;
    const msg = ctx.event.message
      .map(it => it.type === 'text' ? it.text : '')
      .join(' ')
      .trim()
      .slice(0, 150); // 图灵机器人长度限制150

    const postData = JSON.stringify({
      reqType: 0,
      perception: {
        inputText: {
          text: msg,
        },
      },
      userInfo: {
        apiKey,
        userId: 'cqnode',
      },
    });
    const reply = await new Promise<string>(resolve => http.request(
      'http://openapi.turingapi.com/openapi/api/v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      res => {
        res
          .setEncoding('utf8')
          .on('data', chunk => {
            try {
              const resp: TulingResponse = JSON.parse(chunk);
              const replyText = resp.results.filter(it => it.resultType === 'text').map(it => it.values.text).join(',');
              resolve(replyText);
            } catch (e) {
              console.error('CQNode Module Error: tuling error: ', e, chunk);
            }
          });
      },
    ).on('error', e => {
      console.error(`[error]CQNode Tuling Error: ${e}`);
    }).write(postData));
    return ctx.reply(reply, true);
  }, { atme: true });
};

export default Tuling;
