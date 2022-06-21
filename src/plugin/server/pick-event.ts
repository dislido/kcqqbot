import { CQEvent, CQEventType } from '@dislido/cqnode';

const groupProps = [
  'info',
  'name',
  'is_owner',
  'is_admin',
  'all_muted',
  'mute_left',
  'group_id',
  'gid',
] as const;

const memberProps = [
  'info',
  'group_id',
  'card',
  'title',
  'is_friend',
  'is_owner',
  'is_admin',
  'mute_left',
  'user_id',
] as const;

export function pickGroupMessageEvent(event: CQEvent<CQEventType.messageGroup>) {
  return {
    ...event,
    group: groupProps.reduce((g, it) => {
      g[it] = event.group[it];
      return g;
    }, {
      avatar: event.group.getAvatarUrl(100),
    } as any),
    member: memberProps.reduce((mem, it) => {
      mem[it] = event.member[it];
      return mem;
    }, {
      avatar: event.member.getAvatarUrl(100),
    } as any),
  };
}
