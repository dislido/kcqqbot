import { CQNodeConfig } from '@dislido/cqnode/lib/cqnode-robot';
import Help from './modules/help';
import JSVM from './modules/jsvm';
import Repeat from './modules/repeat';
import Tuling from './modules/tuling';
import Roll from './modules/roll';
import Admin from './modules/admin';
import Cron from './modules/cron';
import Setu from './modules/setu';
import GroupBackup from './modules/group-backup';
import DogAdmin from './modules/dog-admin';
import ReceiveGroupRequest from './modules/receive-group-request';
import Server from './plugin/server';

const config: CQNodeConfig = {
  connector: {
    account: 114514,
  },
  admin: [1919810],
  modules: [
    Admin,
    Help,
    DogAdmin,
    JSVM,
    GroupBackup,
    Cron,
    Roll,
    Setu,
    [Repeat, { listLength: 5, limit: 2 }],
    [Tuling, 'abc123'],
    [ReceiveGroupRequest],
  ],
  plugins: [
    [Server, { port: 8016, password: '123456' }],
  ],
};

export default config;
