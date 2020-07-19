import { Plugin, util, HookData, CQEvent } from '@dislido/cqnode';
import JsonStorage from '@dislido/cqnode/types/workpath-manager/json-storage';

const { eventType } = util;

export = class BlockUser extends Plugin {
  storage: JsonStorage<number[]>;

  onReady() {
    this.cqnode.workpath.getJsonStorage<number[]>('plugin/@dislido/block-user/block-list.json', []).then(storage => {
      this.storage = storage;
    });
  }

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
    if (!eventType.isMessage(event) || !this.storage) return true;
    const blockList = new Set(this.storage.get());
    if (this.cqnode.config.get().admin.includes(event.userId)) {
      const cmd = /block\s+([0-9]+)/.exec(event.rawMessage);
      const removeCmd = /block\s+remove\s+([0-9]+)/.exec(event.rawMessage);
      if (cmd) {
        const block = +cmd[1];
        blockList.add(block);
        this.storage.set([...blockList]);
        this.replyByType(event, `已屏蔽${block}`);
        return false;
      } else if (removeCmd) {
        const block = +removeCmd[1];
        blockList.delete(block);
        this.storage.set([...blockList]);
        this.replyByType(event, `已解除屏蔽${block}`);
        return false;
      }
      return true;
    }
    if (blockList.has(event.userId)) return false;
    return true;
  }
}
