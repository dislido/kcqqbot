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
   * 通过cqcode获取图片地址url
   * @deprecated 酷Q将在未来移除此功能
   * @param cqcode
   * @returns 图片url地址
   */
  getImageUrl(cqcode: string) {
    const cqcodeData = CQNode.util.CQCode.parseCQCodeString(cqcode);
    if (!cqcodeData) return cqcode;
    return `[图片${cqcodeData.data.url || cqcodeData.data.file}]`;
  }
  onGroupMessage(data: CQNode.CQEvent.GroupMessage, resp: CQNode.CQResponse.GroupMessage) {
    if (data.atme) {
      const cmd = /聊天记录\.(\d+)/.exec(data.msg);
      if (cmd && (+cmd[1] > 0)) {
        if (+cmd[1] >= this.maxLength) return resp.reply(this.record[data.groupId].join('\n'));
        return resp.reply(this.record[data.groupId].slice(-cmd[1]).join('\n'));
      }
    }
    if (!this.record[data.groupId]) {
      this.record[data.groupId] = [];
    }
    const reclist = this.record[data.groupId];
    reclist.push(
      `${data.username || data.userId}: ${data.msg}`.replace(/\[CQ:image,.*\]/g,
      (cqcode) => this.getImageUrl(cqcode)),
    );
    if (reclist.length > this.maxLength) {
      reclist.shift();
    }
    return false;
  }
};
