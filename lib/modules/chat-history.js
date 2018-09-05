const fs = require('fs');
const path = require('path');
const CQNode = require('@dislido/cqnode');

module.exports = class ChatHistory extends CQNode.Module {
  constructor({ maxLength = 20, imgPath = null } = {}) {
    super();
    this.inf = {
      name: '聊天记录',
      description: '保存最近的聊天记录',
      help: `聊天记录.n
    获取本群最近n条聊天记录`,
    };
    this.record = {};
    this.maxLength = maxLength;
    this.imgPath = imgPath;
  }
  onRun() {
    this.record = {};
  }
  /**
   * 通过图片编号获取图片地址url
   * @param {string} imgId 图片编号
   * @returns {string} 图片url地址
   */
  getImageUrl(imgId) {
    if (!this.imgPath) return imgId;
    try {
      const imgFile = fs.readFileSync(path.resolve(this.imgPath, `${imgId}.cqimg`));
      return /url=(\S+)/.exec(imgFile.toString())[1];
    } catch (e) {
      console.error(e);
      return imgId;
    }
  }
  onGroupMessage({ atme, msg, fromQQ, fromGroup, nick, username }, resp) {
    if (atme) {
      const cmd = /聊天记录\.(\d+)/.exec(msg);
      if (cmd && (+cmd[1] > 0)) {
        if (+cmd[1] >= this.maxLength) resp.send(this.record[fromGroup].join('\n'));
        else resp.send(this.record[fromGroup].slice(-cmd[1]).join('\n'));
        return true;
      }
    }
    if (!this.record[fromGroup]) {
      this.record[fromGroup] = [];
    }
    const reclist = this.record[fromGroup];
    reclist.push(
      `${nick || username || fromQQ}: ${msg}`.replace(/\[CQ:image,file=([^\]]*)\]/g,
      (a, imgId) => `[图片${this.getImageUrl(imgId)}]`),
    );
    if (reclist.length > this.maxLength) {
      reclist.shift();
    }
    return false;
  }
};
