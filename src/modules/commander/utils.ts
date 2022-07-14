import mri from 'mri';
import sq from 'shell-quote';

export interface CommandFunction {
  (ctx: any, cmd: any, api: any): any;
}

const preloadScript = `
const reply = ctx.reply;
const group = ctx.event.group;
const member = ctx.event.member;
`;

export function compileCommand(body: string) {
  return new Function('ctx', 'cmd', 'api', preloadScript + body) as CommandFunction;
}

export function parseCommand<T = Record<string, any>>(text: string, env: any = {}) {
  const command = sq.parse(text, env).filter(it => typeof it === 'string') as string[];
  return mri<T>(command);
}
