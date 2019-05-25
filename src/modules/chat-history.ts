import * as fs from 'fs';
import * as path from 'path';
import * as CQNode from '@dislido/cqnode';

export default module.exports = class ChatHistory extends CQNode.Module {
  record: {
    [group: number]: string[];
  };
  constructor(public maxLength = 20, public imgPath: string = '') {
    super( {
      name: '聊天记录',
      description: '保存最近的聊天记录',
      help: `聊天记录.n
    获取本群最近n条聊天记录`,
      packageName: '@dislido/cqnode-module-chat-history',
    });
    this.record = {};
  }
  onRun() {
    this.record = {};
  }
  /**
   * 通过图片编号获取图片地址url
   * @deprecated 酷Q将在未来移除此功能
   * @param imgId 图片编号
   * @returns 图片url地址
   */
  getImageUrl(imgId: string) {
    if (!this.imgPath) return imgId;
    try {
      const imgFile = fs.readFileSync(path.resolve(this.imgPath, `${imgId}.cqimg`));
      return /url=(\S+)/.exec(imgFile.toString())![1];
    } catch (e) {
      console.error(e);
      return imgId;
    }
  }
  onGroupMessage({ atme, msg, userId, groupId, username }: CQNode.CQEvent.GroupMessage, resp: CQNode.CQResponse.GroupMessage) {
    if (atme) {
      const cmd = /聊天记录\.(\d+)/.exec(msg);
      if (cmd && (+cmd[1] > 0)) {
        if (+cmd[1] >= this.maxLength) resp.send(this.record[groupId].join('\n'));
        else resp.send(this.record[groupId].slice(-cmd[1]).join('\n'));
        return true;
      }
    }
    if (!this.record[groupId]) {
      this.record[groupId] = [];
    }
    const reclist = this.record[groupId];
    reclist.push(
      `${username || userId}: ${msg}`.replace(/\[CQ:image,file=([^\],]*),?.*\]/g,
      (_, imgId) => `[图片${this.getImageUrl(imgId)}]`),
    );
    if (reclist.length > this.maxLength) {
      reclist.shift();
    }
    return false;
  }
};
