import { Module } from '@dislido/cqnode';

export default module.exports = class Repeat extends Module {
  constructor() {
    super({
      name: '接受加群邀请',
      description: '自动接受加群邀请',
      help: `邀请本机器人加群，会自动同意邀请`,
      packageName: '@dislido/cqnode-module-receive-group-request',
    });
    
  }

  onGroupRequest(data: CQNode.CQEvent.GroupRequest, resp: CQNode.CQResponse.GroupRequest) {
    if (data.subType === 'invite') {
      return resp.approve(true);
    }
    return false;
  }
};
