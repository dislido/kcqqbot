import { CQEventType, CQNodeEventContext } from '@dislido/cqnode';

export interface DogAdminCmd {
  desc: string;
  fn: (ctx: CQNodeEventContext<CQEventType.messageGroup>, ...args: any[]) => void | Promise<void>
  level: number
}

export const cmdMap: Record<string, DogAdminCmd> = {
  口: {
    desc: '禁言， "口 $1 $2" $1-禁言对象 $2-时间:分钟,默认1分钟,1~1440',
    async fn(ctx, qq, time) {
      const targetQq = +qq;
      const targetTime = Math.min(+time || 1, 1440);

      if (!targetQq) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.muteMember(targetQq, targetTime);
    },
    level: 1,
  },
  解口: {
    desc: '解除禁言， "解口 $1" $1-禁言对象',
    async fn(ctx, qq) {
      const targetQq = +qq;
      if (!targetQq) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.muteMember(targetQq, 0);
    },
    level: 1,
  },
  // 领头衔: {
  //   desc: '设置自己的头衔 "领头衔 $1" $1-头衔',
  //   level: 0,
  //   async fn(ctx, card = '') {
  //     const targetCard = `${card}`;
  //     await ctx.event.member.setTitle(targetCard);
  //   },
  // },
  改群名: {
    desc: '"改群名 $1" $1-新群名',
    level: 1,
    async fn(ctx, name = '') {
      const targetName = `${name}`;
      if (!name) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.setName(targetName);
    },
  },
  拉人: {
    desc: '"拉人 $1" $1-qq号',
    level: 0,
    async fn(ctx, qq) {
      const targetQQ = +qq;
      if (!qq) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.invite(targetQQ);
    },
  },
  戳人: {
    desc: '"戳人 $1" $1-戳人目标',
    level: 0,
    async fn(ctx, qq) {
      const targetQQ = +qq;
      if (!qq) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.pokeMember(targetQQ);
    },
  },
  改群头像: {
    desc: '"改群头像 $1" $1-图片',
    level: 0,
    async fn(ctx, ...args) {
      const targetFile = args.at(-1).image?.file;
      if (!targetFile) {
        ctx.event.reply('命令格式错误');
        return;
      }
      await ctx.event.group.setAvatar(targetFile);
    },
  },
  撤回: {
    desc: '"撤回" 回复要撤回的消息，去掉at',
    level: 0,
    async fn(ctx, ...args) {
      const targetReply = args.at(-1).reply;
      if (!targetReply) {
        ctx.event.reply('命令格式错误' + JSON.stringify(ctx.event.message));
        return;
      }
      await ctx.event.group.recallMsg(targetReply as string);
    },
  },
  // test: {
  //   desc: '测试用',
  //   level: 10000,
  //   async fn(ctx) {
  //     await ctx.event.group.setName('test');
  //   },
  // },
};
