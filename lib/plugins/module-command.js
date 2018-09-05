/**
 * 模块命令插件
 */
module.exports = class ModuleCommandPlugin {
  onRegister(CQNode) {
    this.CQNode = CQNode;
  }
  groupMessageReceived(event) {
    const { data } = event;
    const msg = data.msg.trim();
    if (msg.startsWith('~#')) {
      const sendBack = (msg) => {
        this.CQNode.utils.send(`[CQ:at,qq=${data.fromQQ}] ` + msg, 101, data.fromGroup);
      };
      const commandList = msg.slice(2).split(' ').filter(it => it !== '');
      const commandModuleName = commandList.shift();
      const command = commandList.shift();
      const targetModule = this.CQNode.modules.find(it => it.inf.name === commandModuleName);
      if (!targetModule) {
        sendBack('未找到指定模块');
        return null;
      }
      if (targetModule.command[commandName]) {
        module.command[commandName](sendBack, ...commandList);
      } else {
        sendBack('该模块无此指令');
      }
      return null;
    }
    return event;
  }
};
