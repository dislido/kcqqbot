import { CQEventType, CQNodeEventContext, FunctionModule } from '@dislido/cqnode';
import type { MemberInfo } from 'oicq';

const sleep = (time: number) => new Promise(res => setTimeout(res, time));

const GroupBackup: FunctionModule = mod => {
  mod.setMeta({
    name: '群备份',
    description: '备份群成员列表，恢复群成员头衔和名片',
    help: `-groupbackup 备份本群成员
-groupbackup backupName 使用备份文件还原本群成员头衔和名片(需要有对应权限)
======
exports:
backupGroup(gid: number): string | null 备份指定群 return 备份名`,
    packageName: '@dislido/cqnode-module-group-backup',
  });

  const backupGroup = async (gid: number) => {
    const group = mod.cqnode.connect.client.pickGroup(gid)
    if (!group) return null
    const memberMap = await group.getMemberMap(true);
    const memberList = Array.from(memberMap.values());
    const storageKey = `${gid}-${new Date().toLocaleString().replaceAll(/\/|:| /g, '')}`; // YYYYMMDDHHmmss
    mod.setStorage(JSON.stringify(memberList, null, 2), storageKey);
    return storageKey;
  };

  const recycle = async (ctx: CQNodeEventContext<CQEventType.messageGroup>, storageKey: string) => {
    const backData = await mod.getStorage(storageKey, null as MemberInfo[] | null);
    if (!backData) {
      return '备份不存在，请确认备份名正确（群号-备份时间戳）';
    }
    const currMap = await ctx.event.group.getMemberMap();
    const curr = Array.from(currMap.values());
    for (let i = 0; i < curr.length; i++) {
      const user = curr[i];
      const oldUser = backData.find(it => user.user_id === it.user_id);
      if (oldUser && (oldUser.card || oldUser.title)) {
        if (oldUser.card && oldUser.card !== user.card) {
          await ctx.event.group.setCard(user.user_id, oldUser.card);
          await sleep(500);
        }
        // 头衔接口坏了
        // if (oldUser.title && oldUser.title !== user.title) {
        //   await ctx.event.group.setTitle(user.user_id, oldUser.card);
        //   await sleep(500);
        // }
      }
    }
    return '群成员名片恢复完毕';
  };

  mod.on(CQEventType.messageGroup, async ctx => {
    const msgText = ctx.event.message.map(it => it.type === 'text' ? it.text : '').join('').trim();
    const match = /-groupbackup\s*(\S+)?/.exec(msgText);
    if (!match) return false;
    if (match[1]) {
      ctx.reply('开始恢复');
      const result = await recycle(ctx, match[1]);
      ctx.reply(result);
      return true;
    }
    const filename = await backupGroup(ctx.event.group_id);
    return ctx.reply(`已备份群成员列表 -> ${filename}`);
  });
  mod.setMeta({
    packageName: '@dislido/cqnode-module-group-backup',
    exports: {
      backupGroup,
    }
  })
};

export default GroupBackup;
