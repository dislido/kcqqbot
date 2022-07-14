import { CQEvent, CQEventType, FunctionModule } from '@dislido/cqnode';
import { CQNodeEventContext } from '@dislido/cqnode/lib/module/event-context';
import commands from './commands';

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
function isGroupMessage(msgData: CQEvent<CQEventType.message>): msgData is CQEvent<CQEventType.messageGroup> {
  return msgData.message_type === 'group';
}

const Admin: FunctionModule = async (mod, { prompt = '~$' } = {}) => {
  mod.setMeta({
    name: '管理员命令',
    help: `使用${prompt}listcmd查看可用命令`,
    description: '命令行控制台功能',
    packageName: '@dislido/cqnode-module-admin',
  });

  /** @todo getStorage#defaultData */
  const authData: AuthData = await mod.getStorage('auth', null) || { admin: mod.cqnode.config.admin || [] };

  const saveUserAuth = () => {
    mod.setStorage(authData, 'auth');
  };

  const getUserAuth = (qqid: number, group?: number) => {
    if (authData.admin.includes(qqid)) return 100;
    if (!group) return 0;
    if (!authData[group]) {
      authData[group] = {};
      saveUserAuth();
      return 0;
    }
    return authData[group][qqid] || 0;
  };

  const dispatchCmd = async (cmd: string, ctx: CQNodeEventContext<CQEventType.message>) => {
    const cmdName = cmd.split(/\s/, 1)[0];
    const cmdStr = cmd.substring(cmdName.length).trim();
    const userAuth = await getUserAuth(ctx.event.sender.user_id, isGroupMessage(ctx.event) ? ctx.event.group_id : undefined);
    if (!commands[cmdName]) {
      ctx.reply(`无此命令, 使用${prompt}listcmd命令查看所有可用命令`);
      return;
    }
    if (commands[cmdName].auth > userAuth) {
      ctx.reply(`权限不足(${userAuth} - ${commands[cmdName].auth}), 使用${prompt}listcmd命令查看所有可用命令`);
      return;
    }
    await commands[cmdName].exec(cmdStr, { ctx, userAuth, commands });
  };

  mod.on(CQEventType.message, async ctx => {
    const textMsg = ctx.event.message.map(it => it.type === 'text' ? it.text : '').join('').trim();
    if (!textMsg.startsWith(prompt)) return false;
    const cmd = textMsg.substring(prompt.length).trim();
    await dispatchCmd(cmd, ctx);
    return true;
  });
};

export default Admin;
