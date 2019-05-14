import * as fs from 'fs';
import * as path from 'path';
import * as CQNode from '@dislido/cqnode';
import commands from './commands';
import { Command } from './admin-command';

function isGroupMessage(msgData: CQNode.CQEvent.MessageEvent): msgData is CQNode.CQEvent.GroupMessageEvent {
  if (msgData.messageType === 'group') return true;
  return false;
}
class Admin extends CQNode.Module {
  /** @todo */
  commands: {
    [cmdName: string]: Command;
  };
  /** @todo */
  authData: any;
  filepath: string;
  constructor(public prompt = '~$') {
    super({
      name: '管理员命令',
      help: `使用${prompt}listcmd查看可用命令`,
      description: '命令行控制台功能',
      packageName: '@dislido/cqnode-module-admin',
    });

    this.commands = commands;
    this.authData = {};
  }

  onRun() {
    this.loadUserAuth();
  }

  onGroupMessage(msgData: CQNode.CQEvent.GroupMessageEvent, resp: CQNode.CQNodeEventResponse.GroupMessageResponse) {
    if (!msgData.atme) return false;
    return this.requestAdmin(msgData, resp);
  }

  onPrivateMessage(msgData: CQNode.CQEvent.PrivateMessageEvent, resp: CQNode.CQNodeEventResponse.PrivateMessageResponse) {
    return this.requestAdmin(msgData, resp);
  }

  requestAdmin(msgData: CQNode.CQEvent.MessageEvent, resp: CQNode.CQNodeEventResponse.MessageResponse) {
    if (!msgData.msg.startsWith(this.prompt)) return false;
    const cmd = msgData.msg.substring(this.prompt.length).trim();
    this.dispatchCmd(cmd, msgData, resp);
    return true;
  }

  dispatchCmd(cmd: string, msgData: CQNode.CQEvent.MessageEvent, resp: CQNode.CQNodeEventResponse.MessageResponse) {
    const cmdName = cmd.split(' ', 1)[0];
    const cmdStr = cmd.substring(cmdName.length).trim();
    const userAuth = this.getUserAuth(msgData.userId, isGroupMessage(msgData) ? msgData.groupId : undefined);
    if (!this.commands[cmdName]) {
      resp.send(`无此命令, 使用${this.prompt}listcmd命令查看所有可用命令`);
      return;
    }
    if (this.commands[cmdName].auth > userAuth) {
      resp.send(`权限不足(${userAuth} - ${this.commands[cmdName].auth}), 使用${this.prompt}listcmd命令查看所有可用命令`);
      return;
    }
    this.commands[cmdName].exec.call(this, cmdStr, { msgData, resp, bindingCQNode: this.bindingCQNode });
  }

  getUserAuth(qqid: number, group?: number) {
    if (this.authData.admin.includes(qqid)) return 100;
    if (!group) return 0;
    if (!this.authData[group]) {
      this.authData[group] = {};
      this.saveUserAuth();
      return 0;
    }
    return this.authData[group][qqid] || 0;
  }

  setUserAuth(qqid: number, group: number, auth: number) {
    if (!this.authData[group]) this.authData[group] = {};
    this.authData[group][qqid] = auth;
  }

  saveUserAuth() {
    this.filepath = this.getFilepath();
    const authDataPath = path.resolve(this.filepath, 'auth.json');
    fs.writeFileSync(authDataPath, JSON.stringify(this.authData, null, 2));
  }

  loadUserAuth() {
    this.filepath = this.getFilepath();
    const authDataPath = path.resolve(this.filepath, 'auth.json');
    const admin = this.bindingCQNode.config.admin;
    if (fs.existsSync(authDataPath)) {
      this.authData = JSON.parse(fs.readFileSync(authDataPath).toString());
      this.authData.admin = admin;
    } else {
      this.authData = {
        admin,
      };
      this.saveUserAuth();
    }
  }
};

module.exports = Admin;
export default Admin;

/*
command(cmdStr, { msgData, resp, CQNode })

auth: {
  admin: 100,
  groupAdmin: 50,
  normal: 0,
}
 */
