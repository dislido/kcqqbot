const Koa = require('koa');
const router = require('koa-router');
const websockify = require('koa-websocket');

const wsOptions = {};
const app = websockify(new Koa(), wsOptions);
console.log(router);
app.ws.use(router.all('/', (ctx: any) => {
  // the websocket is added to the context as `ctx.websocket`.
  ctx.websocket.on('message', (message: any) => {
    // print message from the client
    console.log(message);
  });
}));

app.listen(3000);
