import {
  CQEventType,
  FunctionModule,
  util,
} from '@dislido/cqnode';
import { CommandFunction, compileCommand, parseCommand } from './utils';

export interface AddCmdOptions {
  /** 命令描述 */
  description?: string;
  /** 帮助信息 */
  help?: string;
  /** 是否全局生效 */
  global?: boolean;
  /** 不需要at */
  noat?: boolean;
}

interface CommandData {
  name: string;
  body: string;
  description?: string;
  help?: string;
  noat?: boolean;
  fn?: CommandFunction;
}

interface CommandBase {
  global: Record<string, CommandData>;
  [groupId: number]: Record<string, CommandData>;
}

const Commander: FunctionModule = async mod => {
  mod.setMeta({
    name: '命令定义器',
    description: '自定义命令',
    packageName: '@dislido/cqnode-module-commander',
  });

  const commands = await mod.getStorage<CommandBase>('default', {
    global: {},
  });

  const saveCmd = () => mod.setStorage(commands, 'default');

  const addCmd = (data: CommandData, group?: number) => {
    if (group && !commands[group]) {
      commands[group] = {};
    }
    const target = group ? commands[group] : commands.global;

    const {
      help, description, body, name, noat,
    } = data;

    if (target[name]) {
      throw new Error(`${name} 命令已被注册`);
    }
    const cmdFn = compileCommand(body);

    const compiled: CommandData = {
      name,
      body,
      fn: cmdFn,
      help,
      description,
      noat,
    };

    target[name] = compiled;
  };

  Object.values(commands).forEach((ns: Record<string, CommandData>) => {
    Object.values(ns).forEach(it => {
      it.fn = compileCommand(it.body);
    });
  });

  const listCmd = (group?: number) => {
    const globalCmds = Object.values(commands.global).map(it => `${it.name} ${it.description || ''}`).join('\n');
    const groupCmds = group && commands[group] ? Object.values(commands[group]).map(it => `${it.name} ${it.description || ''}`).join('\n') : '';
    return `全局命令：\n${globalCmds}${groupCmds && `本群命令：\n${groupCmds}`}`;
  };

  const deleteCmd = (name: string, group?: number) => {
    const target = group ? commands[group] : commands.global;
    Reflect.deleteProperty(target, name);
    saveCmd();
    return '已删除自定义命令';
  };

  mod.on(CQEventType.message, async ctx => {
    const { message, sender } = ctx.event;
    const textMessage = message.map(it => it.type === 'text' ? it.text : '').join('').trim();
    const groupId = util.assertEventType(ctx.event, CQEventType.messageGroup) ? ctx.event.group_id : undefined;
    const cmd = parseCommand<AddCmdOptions>(textMessage);

    if (cmd._[0] === 'commander' && ctx.atme) {
      const type = cmd._[1];
      if (type === 'list') {
        const result = listCmd(groupId);
        ctx.event.reply(result);
        return true;
      }
      if (!mod.cqnode.config.admin?.includes(sender.user_id)) return false;
      if (type === 'add') {
        addCmd(
          {
            name: cmd._[2],
            body: cmd._[3],
            ...cmd,
          },
          cmd.global ? undefined : groupId,
        );
        saveCmd();
        ctx.event.reply('已添加自定义命令');
        return true;
      }

      if (type === 'delete') {
        const result = deleteCmd(cmd._[2], cmd.global ? undefined : groupId);
        ctx.event.reply(result);
        return true;
      }
    }

    const targetCmd = (groupId ? commands[groupId] : {})?.[cmd._[0]] || commands.global[cmd._[0]];
    if (targetCmd) {
      if (!ctx.atme && !targetCmd.noat) return false;
      try {
        const result = targetCmd.fn?.(ctx, cmd, mod.api);
        if (result) ctx.reply(`${result}`);
      } catch (e) {
        ctx.reply(`Error: ${e.message || e}`);
      }
      return true;
    }

    return false;
  }, { atme: false });
};

export default Commander;
