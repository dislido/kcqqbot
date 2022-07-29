import EventEmitter from 'events';
import fs from 'fs';
import {
  CQNodeHook,
  FunctionPlugin,
  util,
} from '@dislido/cqnode';
import { OICQAPI } from '@dislido/cqnode/lib/connector-oicq/proxy-oicq-api';
import Koa from 'koa';
import koaRoute from 'koa-route';
import koaBody from 'koa-body';
import koaWebsocket from 'koa-websocket';
import pickEvent from './pick-event';

interface CQNodeServerConfig {
  port?: number;
  password?: string;
  evCacheLength?: number;
  onStart?(): void;
}
const Server: FunctionPlugin = (plg, config: CQNodeServerConfig = {}) => {
  const { port = 8016, evCacheLength = 100 } = config;
  plg.setMeta({
    name: 'cqnode服务器',
    description: '机器人服务器',
    packageName: '@dislido/cqnode-plugin-server',
  });
  plg.cqnode.workpathManager.ensurePath(plg.storagePath, null);
  const app = koaWebsocket(new Koa(), {});
  app.use(koaBody({
    multipart: true,
    formidable: {
      uploadDir: plg.storagePath,
      keepExtensions: true,
    },
  }));

  const evCache: any[] = [];
  const pushEvCache = (data: any) => {
    evCache.push(data);
    if (evCache.length > evCacheLength) evCache.shift();
  };

  const ee = new EventEmitter();
  plg.on(CQNodeHook.beforeEventProcess, plgCtx => {
    const data = {
      msgType: 'event',
      event: pickEvent(plgCtx.event),
      eventType: plgCtx.eventType,
    };
    ee.emit('event', data);
    pushEvCache(data);
    return plgCtx;
  });

  app.ws.use(koaRoute.all('/ws', async ctx => {
    let close = () => {};
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

        const listener = (ev: any) => ctx.websocket.send(JSON.stringify(ev));
        ee.on('event', listener);
        close = () => ee.off('event', listener);

        ctx.websocket.send(JSON.stringify({
          msgType: 'resp',
          id: data.id,
          code: 0,
          data: {
            uid: plg.cqnode.connect.client.uin,
            evHistory: evCache,
          },
        }));
        return;
      }
      if (!authed) {
        ctx.websocket.send(JSON.stringify({
          msgType: 'resp', id: data.id, code: 403, msg: 'unauthed',
        }));
        return;
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
        return;
      }
      ctx.websocket.send(JSON.stringify({
        msgType: 'resp', id: data.id, code: 404, msg: 'msgType not found',
      }));
    });
    ctx.websocket.on('close', () => {
      close();
    });
  }));

  app.use(koaRoute.post('/api/uploadImage', async ctx => {
    const file = ctx.request.files?.file;
    if (!file || Array.isArray(file)) {
      ctx.status = 400;
      ctx.body = 'no file';
      return;
    }

    const { target } = ctx.request.body;
    const [targetType, targetId] = target.split(':');
    const fileBuf = await fs.promises.readFile(file.filepath);
    const imgElem = util.segment.image(fileBuf);

    fs.promises.rm(file.filepath);

    if (targetType === 'group') {
      const group = plg.cqnode.connect.client.pickGroup(+targetId);
      await group.uploadImages([imgElem]);
      await group.sendMsg(imgElem);
      ctx.status = 200;
      ctx.body = 'ok';
      return;
    }

    ctx.status = 400;
    ctx.body = 'no target';
  }));

  plg.on(CQNodeHook.afterInit, data => {
    app.listen(port, config.onStart);
    return data;
  });
};

export default Server;
