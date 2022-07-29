import path from 'path';
import Koa from 'koa';
import koaRoute from 'koa-route';
import koaBody from 'koa-body';
import koaWebsocket from 'koa-websocket';

const app = koaWebsocket(new Koa(), {});

app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname),
    keepExtensions: true,
  },
}));
app.use(koaRoute.post('/api/uploadImage', async ctx => {
  const file = ctx.request.files?.file;
  if (!file || Array.isArray(file)) {
    ctx.status = 400;
    ctx.body = 'no file';
    return;
  }

  console.log(file.filepath, ctx.request.body);
  ctx.status = 200;
  ctx.body = 'ok';
}));

app.listen(8016);
console.log('start');
