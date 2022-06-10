import { CQEventType, FunctionModule } from '@dislido/cqnode';

const ReceiveGroupRequest: FunctionModule = mod => {
  mod.setMeta({
    name: '接受加群邀请',
    description: '自动接受加群邀请',
    help: '邀请本机器人加群，会自动同意邀请',
    packageName: '@dislido/cqnode-module-receive-group-request',
  });

  mod.on(CQEventType.requestGroupInvite, ctx => {
    ctx.event.approve();
    return true;
  });
};

export default ReceiveGroupRequest;
