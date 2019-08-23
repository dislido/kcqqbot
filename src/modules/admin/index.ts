import * as fs from 'fs';
import * as path from 'path';
import * as CQNode from '@dislido/cqnode';
import commands from './commands';
import { Command } from './admin-command';

enum Auth {
  Default = 0,
  Admin = 1,
  GroupAdmin = 2,
}
interface AuthData {
  admin: number[];
  [group: number]: {
    [qqid: number]: Auth;
  }
}
function isGroupMessage(msgData: CQNode.CQEvent.Message): msgData is CQNode.CQEvent.GroupMessage {
  if (msgData.messageType === 'group') return true;
  return false;
}
class Admin extends CQNode.Module {
  commands: {
    [cmdName: string]: Command;
  };
  authData: AuthData;
  filepath: string;
  constructor(public prompt = '~$') {
    super({
      name: '管理员命令',
      help: `使用${prompt}listcmd查看可用命令`,
      description: '命令行控制台功能',
      packageName: '@dislido/cqnode-module-admin',
    });

    this.commands = commands;
    this.authData = { admin: [] };
  }

  onRun() {
    this.loadUserAuth();
  }

  onGroupMessage(msgData: CQNode.CQEvent.GroupMessage, resp: CQNode.CQResponse.GroupMessage) {
    if (!msgData.atme) return false;
    return this.requestAdmin(msgData, resp);
  }

  onPrivateMessage(msgData: CQNode.CQEvent.PrivateMessage, resp: CQNode.CQResponse.PrivateMessage) {
    return this.requestAdmin(msgData, resp);
  }

  requestAdmin(msgData: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!msgData.msg.startsWith(this.prompt)) return false;
    const cmd = msgData.msg.substring(this.prompt.length).trim();
    this.dispatchCmd(cmd, msgData, resp);
    return true;
  }

  /**
   * 处理命令
   * @param cmd 命令内容
   * @param msgData 
   * @param resp 
   */
  dispatchCmd(cmd: string, msgData: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    const cmdName = cmd.split(' ', 1)[0];
    const cmdStr = cmd.substring(cmdName.length).trim();
    const userAuth = this.getUserAuth(msgData.userId, isGroupMessage(msgData) ? msgData.groupId : undefined);
    if (!this.commands[cmdName]) {
      resp.reply(`无此命令, 使用${this.prompt}listcmd命令查看所有可用命令`);
      return;
    }
    if (this.commands[cmdName].auth > userAuth) {
      resp.reply(`权限不足(${userAuth} - ${this.commands[cmdName].auth}), 使用${this.prompt}listcmd命令查看所有可用命令`);
      return;
    }
    this.commands[cmdName].exec.call(this, cmdStr, { msgData, resp, cqnode: this.cqnode });
  }
  /**
   * 获取用户权限
   * @param qqid 用户qq号
   * @param group 群号
   */
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

  setUserAuth(qqid: number, auth: number, group: number) {
    if (!this.authData[group]) this.authData[group] = {};
    this.authData[group][qqid] = auth;
    this.saveUserAuth();
  }

  /**
   * 保存用户权限信息文件
   */
  saveUserAuth() {
    this.filepath = this.getFilepath();
    const authDataPath = path.resolve(this.filepath, 'auth.json');
    fs.writeFileSync(authDataPath, JSON.stringify(this.authData, null, 2));
  }

  /**
   * 加载用户权限信息文件
   */
  loadUserAuth() {
    this.filepath = this.getFilepath();
    const authDataPath = path.resolve(this.filepath, 'auth.json');
    const admin = this.cqnode.config.admin;
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
