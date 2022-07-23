import {
  CQEvent, CQEventType, util, oicq,
} from '@dislido/cqnode';

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

/** @todo @WIP 处理事件中的getter属性 */
export default function pickEvent(event: CQEvent) {
  if (!event) return event;
  const e: CQEvent = { ...event };
  if (util.assertEventType(e, CQEventType.messageGroup)) {
    e.member = memberProps.reduce((mem, it) => {
      mem[it] = e.member[it];
      return mem;
    }, {
      avatar: e.member.getAvatarUrl(100),
    } as any);
  }

  if (util.assertEventType(e, CQEventType.noticeGroupPoke)) {
    const operator = e.group.pickMember(e.operator_id);
    const target = e.group.pickMember(e.target_id);
    Object.assign(e, {
      operatorName: operator.card || operator.info?.nickname || `${operator.uid}`,
      targetName: target.card || target.info?.nickname || `${target.uid}`,
    });
  }

  if ('group' in e && e.group instanceof oicq.Group) {
    e.group = groupProps.reduce((g, it) => {
      g[it] = e.group[it];
      return g;
    }, {
      avatar: e.group.getAvatarUrl(100),
    } as any);
  }

  return e;
}
