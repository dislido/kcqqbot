import Admin from './index';
import { CQEvent, CQResponse, CQNodeRobot } from '@dislido/cqnode';

declare interface Command {
  exec(this: Admin, cmd: string, data: { msgData: CQEvent.Message, resp: CQResponse.Message, bindingCQNode: CQNodeRobot }): void | Promise<void>;
  auth: number;
  description: string;
}