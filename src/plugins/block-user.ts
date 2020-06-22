import { Plugin, util, HookData, CQEvent } from '@dislido/cqnode';

const { eventType } = util;

export default class BlockUser extends Plugin {
  blockUsers = new Set<number>();

  replyByType(event: CQEvent.Message, msg: string) {
    const { api } = this.cqnode;
    if (eventType.isGroupMessage(event)) {
      api.sendGroupMsg(event.groupId, msg);
    } else if (eventType.isPrivateMessage(event)) {
      api.sendPrivateMsg(event.userId, msg);
    } else if (eventType.isDiscussMessage(event)) {
      api.sendDiscussMsg(event.discussId, msg);
    }
  }
  onEventReceived({ event }: HookData.onEventReceived) {
    if (!eventType.isMessage(event)) return true;
    if (this.cqnode.config.admin.includes(event.userId)) {
      const cmd = /block\s+([0-9]+)/.exec(event.rawMessage);
      const removeCmd = /block\s+remove\s+([0-9]+)/.exec(event.rawMessage);
      if (cmd) {
        const block = +cmd[1];
        this.blockUsers.add(block);
        this.replyByType(event, `已屏蔽${block}`);
        return false;
      } else if (removeCmd) {
        const block = +removeCmd[1];
        this.blockUsers.delete(block);
        this.replyByType(event, `已解除屏蔽${block}`);
        return false;
      }
      return true;
    }
    if (this.blockUsers.has(event.userId)) return false;
    return true;
  }
}
