import Admin from './index';
import { CQEvent, CQNodeEventResponse, CQNodeRobot } from '@dislido/cqnode';

declare interface Command {
  exec(this: Admin, cmd: string, data: { msgData: CQEvent.MessageEvent, resp: CQNodeEventResponse.MessageResponse, bindingCQNode: CQNodeRobot }): void | Promise<void>;
  auth: number;
  description: string;
}