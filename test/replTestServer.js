const repl = require('repl');
const CQNode = require('../lib/robot');
const config = require('../config');
const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ port: 25303 });

const r = repl.start({ prompt: '>' });

wss.on('connection', (connect) => {
  console.log('conn');
  r.context.send = (msg, fromGroup = '177720545', fromQQ = '100263') => connect.send(JSON.stringify({
    act: 2,
    msg: msg.replace(/@@/g, '[CQ:at,qq=191107040]'),
    fromGroup,
    fromQQ,
  }));

  connect.on('close', (message) => {
    console.log('closed', message);
  });
  const tests = [
    '@@ test something',
    '@@ 官推',
  ];
  tests.forEach(it => r.context.send(it));
});

console.log('start CQNode:', new CQNode(config));
