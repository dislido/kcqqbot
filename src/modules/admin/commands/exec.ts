import util from 'util';
import childProcess from 'child_process';
import iconv from 'iconv-lite';
import { Command } from '../admin-command';

const exec = util.promisify(childProcess.exec);
const TIME_OUT = 60000;

const decode = (hexStr: string) => {
  const arr = [...hexStr].reduce((obj, curr) => {
    obj.next = !obj.next;
    if (obj.next) {
      obj.arr.push([curr]);
    } else {
      obj.arr[obj.arr.length - 1].push(curr);
    }
    return obj;
  }, { arr: [] as string[][], next: false })
    .arr
    .map(it => parseInt(it.join(''), 16));
  return iconv.decode(Buffer.from(arr), 'GBK');
};

export default {
  async exec(cmd: string, { ctx }) {
    let err = '';
    try {
      const timeout = setTimeout(() => { err += '执行超时\n'; }, TIME_OUT);
      const startTime = Date.now();
      const result = await exec(cmd, { timeout: TIME_OUT, encoding: 'hex' });
      const endTime = Date.now();
      clearTimeout(timeout);
      ctx.reply(`执行完毕，耗时${(endTime - startTime) / 1000}秒:
stdout: ${decode(result.stdout)}
------
stderr: ${decode(result.stderr)}
`);
    } catch (e) {
      ctx.reply(`result: ${err}\nerrcode:${e.code}\ncmd:${e.cmd}\nstdout:${decode(e.stdout)}\nstderr:${decode(e.stderr)}`);
    }
  },
  auth: 100,
  description: '执行cmd命令: exec (命令行内容)',
} as Command;
