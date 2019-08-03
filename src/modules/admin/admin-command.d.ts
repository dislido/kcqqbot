import Admin from './index';
import { CQEvent, CQResponse, Robot } from '@dislido/cqnode';

declare interface Command {
  exec(this: Admin, cmd: string, data: { msgData: CQEvent.Message, resp: CQResponse.Message, cqnode: Robot }): void | Promise<void>;
  auth: number;
  description: string;
}