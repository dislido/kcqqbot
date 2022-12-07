import { CQEventType, CQNodeEventContext } from "@dislido/cqnode";

export interface DogAdminCmd {
  params: Array<{}>;
  desc: string;
  fn: (ctx: CQNodeEventContext<CQEventType.messageGroup>, ...args: string[]) => void | Promise<void>
  level: number
}

export const cmdMap: Record<string, DogAdminCmd> = {
  '口': {
    params: [],
    desc: '禁言， "口 @xxx 1" -单位分钟,默认1分钟，1~1440 ',
    async fn(ctx, qq, time) {
      const targetQq = +qq;
      const targetTime = Math.min(+time || 1, 1440)
      
      if (!targetQq) ctx.event.reply('命令格式错误')
      await ctx.event.group.muteMember(targetQq, targetTime)
    },
    level: 1,
  },
  '解口': {
    params: [],
    desc: '解除禁言， "解口 @xxx"',
    async fn(ctx, qq) {
      const targetQq = +qq;
      if (!targetQq) ctx.event.reply('命令格式错误')
      await ctx.event.group.muteMember(targetQq, 0)
    },
    level: 1
  },
};
