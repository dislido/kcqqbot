import { CQNodeConfig } from '@dislido/cqnode/lib/cqnode-robot';
// import Help from './src/modules/help';
// import JSVM from './src/modules/jsvm';
import Repeat from './src/modules/repeat';
import Tuling from './src/modules/tuling';
import Roll from './src/modules/roll';
import Admin from './src/modules/admin';
// import GroupBackup from './src/modules/group-backup';
import ReceiveGroupRequest from './src/modules/receive-group-request';

// import MsgTail from './plugins/msg-tail';
// import BlockUser from './plugins/block-user';

const config: CQNodeConfig = {
  connector: {
    account: 114514,
    password: '114514',
  },
  admin: [1919810],
  modules: [
    Admin,
    // new Help(),
    // new JSVM(),
    // new ChatHistory(20),
    // new Notify(),
    // new Repeat(),
    // new TimeCall({
    //   use: [
    //     { group: 810, use: 'kiyoshimo' },
    //   ],
    // }),
    // new GroupBackup(),
    Roll,
    [Repeat, { listLength: 5, limit: 2 }],
    [Tuling, 'abcdef'],
    [ReceiveGroupRequest],
  ],
  plugins: [
    // new MsgTail('\n from CQNode'),
    // new BlockUser(),
  ],
  workpath: '.cqnode',
  atmeTrigger: [true],
};

export default config;
