import { Plugin } from '@dislido/cqnode';

interface MsgTail {
  tail: string;
}
const MsgTail = new Plugin.Factory()
  .onResponse(function (this: MsgTail, data) {
    if (data.body.reply) data.body.reply += this.tail;
    return true;
  })
  .onRequestAPI(function (this: MsgTail, data) {
    if (['sendPrivateMsg', 'sendGroupMsg', 'sendDiscussMsg'].includes(data.apiName)) data.params[1] += this.tail;
    if (data.apiName === 'sendMsg') data.params[2] += this.tail;
    return true;
  })
  .createConstructor(function (this: MsgTail, tail: string) {
    this.tail = tail;
  });

export default module.exports = MsgTail;
