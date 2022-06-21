import {
  CQEvent,
  CQEventType,
  CQNodeHook,
  FunctionPlugin,
} from '@dislido/cqnode';
import { OICQAPI } from '@dislido/cqnode/lib/connector-oicq/proxy-oicq-api';
import Koa from 'koa';
import koaRoute from 'koa-route';
import koaWebsocket from 'koa-websocket';
import { pickGroupMessageEvent } from './pick-event';

interface CQNodeServerConfig {
  port?: number;
  password?: string;
}
const Server: FunctionPlugin = (plg, config: CQNodeServerConfig = {}) => {
  plg.setMeta({
    name: 'cqnode服务器',
    description: 'websocket服务器',
    packageName: '@dislido/cqnode-plugin-server',
  });
  const app = koaWebsocket(new Koa(), {});

  app.ws.use(koaRoute.all('/', async ctx => {
    const close = () => {};
    let authed = !config.password;

    ctx.websocket.on('message', async (msg: Buffer) => {
      const data = JSON.parse(msg.toString());
      if (data.type === 'auth') {
        if (!authed && data.password !== config.password) {
          ctx.websocket.send(JSON.stringify({
            msgType: 'resp', id: data.id, code: 403, msg: 'wrong password',
          }));
          return;
        }
        authed = true;
        plg.on(CQNodeHook.beforeEventProcess, plgCtx => {
          if (plgCtx.eventType === CQEventType.messageGroup) {
            ctx.websocket.send(JSON.stringify({
              msgType: 'event',
              event: pickGroupMessageEvent(plgCtx.event as CQEvent<CQEventType.messageGroup>),
              eventType: plgCtx.eventType,
            }));
          }
          return plgCtx;
        });
        ctx.websocket.send(JSON.stringify({
          msgType: 'resp', id: data.id, code: 0, msg: 'success',
        }));
        return;
      }
      if (!authed) {
        ctx.websocket.send(JSON.stringify({
          msgType: 'resp', id: data.id, code: 403, msg: 'unauthed',
        }));
      }
      if (data.type === 'callApi') {
        const api = plg.cqnode.connect.api[data.apiName as keyof OICQAPI] as (...params: any) => any;

        if (!api) {
          ctx.websocket.send(JSON.stringify({
            msgType: 'resp', id: data.id, code: 404, msg: 'api notfound',
          }));
        }
        const result = await api(...data.params);

        ctx.websocket.send(JSON.stringify({
          msgType: 'resp', id: data.id, code: 0, data: result,
        }));
      }
      ctx.websocket.send(JSON.stringify({
        msgType: 'resp', id: data.id, code: 404, msg: 'msgType not found',
      }));
    });
    ctx.websocket.on('close', () => {
      close();
    });
  }));

  app.listen(config.port || 8016);
};

export default Server;
