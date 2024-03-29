import { CQEventType, FunctionModule } from '@dislido/cqnode';
import { AtElem, ReplyElem } from 'oicq';
import { parseCommand } from '../commander/utils';
import { cmdMap } from './cmd';

const help = `命令格式
狗管理 [command] [...params]
------
command: 要使用的权限，使用"狗管理 help"命令查看所有支持的权限
params: 权限参数，多个参数用空格分开，使用"狗管理 help"命令查看各权限所需参数`;

const Cron: FunctionModule = mod => {
  mod.setMeta({
    name: '狗管理',
    description: '权限自助',
    help,
    packageName: '@dislido/cqnode-module-dog-admin',
  });

  mod.on(CQEventType.messageGroup, async ctx => {
    const msg = ctx.textMessage;

    if (!msg.startsWith('狗管理')) return false;
    const commandStr = ctx.event.message.reduce((str, curr) => {
      if (curr.type === 'text') return `${str} ${curr.text} `;
      return str;
    }, '');
    const cmd = parseCommand(commandStr);
    const ex = {at: ctx.event.message.find((it): it is AtElem => it.type === 'at')?.qq, image: ctx.event.message.find(it => it.type === 'image'), reply: ctx.event.message.find((it): it is ReplyElem => it.type === 'reply')?.id}

    const segments = [...cmd._];
    segments.shift();

    if (!segments.length) {
      ctx.event.reply(help);
      return true;
    }

    const methodName = segments.shift()!;
    if (methodName === 'help') {
      const result = Object.entries(cmdMap).map(([name, cmdDef]) => `${name} ${cmdDef.desc}`).join('\n');
      ctx.event.reply(result);
      return true;
    }

    let senderLevel = 0;

    if (ctx.event.member.is_admin) senderLevel = 10;
    if (ctx.event.member.is_owner) senderLevel = 100;
    if (ctx.cqnode.config.admin?.includes(ctx.event.member.uid)) senderLevel = Infinity;
    const cmdDef = cmdMap[methodName];

    if (!cmdDef) {
      ctx.event.reply(`没有此命令 ${methodName} (${cmd._.join(' ')}) {${JSON.stringify(ctx.event.message)}}`);
      return true;
    }

    if (senderLevel < cmdDef.level) {
      ctx.event.reply(`权限不足，你的权限是${senderLevel}, 此命令需要权限${cmdDef.level} (管理员权限10，群主权限100，第一次使用可能未加载权限，重试即可)`);
      return true;
    }
    try {
      await cmdDef.fn(ctx, ...cmd._, ex);
    } catch (e) {
      ctx.event.reply(`未知错误： ${e.message} ${(e as Error).stack}`)
    }

    return true;
  });
};

export default Cron;
