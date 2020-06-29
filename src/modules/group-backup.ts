import * as CQNode from '@dislido/cqnode';
import * as fs from 'fs';
import * as path from 'path';

const sleep = (time: number) => new Promise(res => setTimeout(res, time));

export default module.exports = class GroupBackup extends CQNode.Module {
  constructor() {
    super({
      name: '群备份',
      description: '备份群成员列表，恢复群成员头衔和名片',
      help: '',
      packageName: '@dislido/cqnode-module-group-backup',
    });
  }

  async onGroupMessage(data: CQNode.CQEvent.GroupMessage, resp: CQNode.CQResponse.GroupMessage) {
    if (!data.atme) return false;
    const match = /-groupbackup\s*(\S+)?/.exec(data.msg);
    if (!match) return false;
    if (match[1]) {
      this.cqnode.api.sendGroupMsg(data.groupId, '开始恢复');
      const result = await this.recycle(data.groupId, match[1]);
      this.cqnode.api.sendGroupMsg(data.groupId, result);
      return true;
    } else {
      const filename = await this.backup(data.groupId);
      return resp.reply(`已备份群成员列表 -> ${filename}`);
    }
    return false;
  }

  async backup(groupId: number) {
    const list = await this.cqnode.api.getGroupMemberList(groupId);
    const fname = `${groupId}-${Date.now()}.json`;
    fs.writeFileSync(path.resolve(await this.getFilepath(), `${groupId}-${Date.now()}.json`), JSON.stringify(list, null, 2));
    return fname;
  }

  onRun() {
    this.backup(685955293);
  }

  async recycle(groupId: number, filename: string) {
    const filepath = path.resolve(await this.getFilepath(), filename);
    if (!fs.existsSync(filepath)) {
      return '备份文件不存在，请确认文件名正确（群号-备份时间戳.json）';
    }
    const data: CQNode.CQHTTP.GetGroupMemberInfoResponseData[] = JSON.parse(fs.readFileSync(filepath).toString()).data;
  
    const curr = await this.cqnode.api.getGroupMemberList(groupId);
    for (let i = 0; i < curr.data.length; i++) {
      const user = curr.data[i];
      const oldUser = data.find((it) => user.user_id === it.user_id);
      if (oldUser && (oldUser.card || oldUser.title)) {
        if (oldUser.card && oldUser.card !== user.card) {
          await this.cqnode.api.setGroupCard(groupId, user.user_id, oldUser.card);
          await sleep(500);
        }
        if (oldUser.title && oldUser.title !== user.title) {
          await this.cqnode.api.setGroupSpecialTitle(groupId, user.user_id, oldUser.title);
          await sleep(500);
        }
      }
    }
    return '群成员头衔&名片恢复完毕';
  }
};
