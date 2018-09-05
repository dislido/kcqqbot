/**
 * 在发送的消息后加小尾巴
 */
module.exports = class MsgTailPlugin {
  constructor(tail = '') {
    this.tail = tail;
  }
  beforeSendMessage(msgObj) {
    msgObj.msg += this.tail;
  }
};
