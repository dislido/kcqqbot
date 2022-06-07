import { CQEventType, CQNodeEventContext } from '@dislido/cqnode';

export interface Command {
  exec(cmd: string, data: {
    ctx: CQNodeEventContext<CQEventType.message>;
    userAuth: number;
    commands: Record<string, Command>;
  }): void | Promise<void>;
  auth: number;
  description: string;
}
