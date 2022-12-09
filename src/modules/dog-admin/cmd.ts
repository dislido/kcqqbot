import { CQEventType, CQNodeEventContext } from '@dislido/cqnode';

export interface DogAdminCmd {
  desc: string;
  fn: (ctx: CQNodeEventContext<CQEventType.messageGroup>, ...args: string[]) => void | Promise<void>
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
    desc: '"改群名 $1" $-新群名 ',
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
  // test: {
  //   desc: '测试用',
  //   level: 10000,
  //   async fn(ctx) {
  //     await ctx.event.group.setName('test');
  //   },
  // },
};
