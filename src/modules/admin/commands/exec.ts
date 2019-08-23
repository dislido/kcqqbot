import { Command } from "../admin-command";
import { Module } from "@dislido/cqnode";
import CQNode = require("@dislido/cqnode");

const util = require('util');
const childProcess = require('child_process');
const iconv = require('iconv-lite');

const exec = util.promisify(childProcess.exec);

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

const TIME_OUT = 10000;

export default {
  async exec(this: Module, cmd: string, { msgData, resp }) {
    const id = CQNode.util.eventType.isGroupMessage(msgData) ? msgData.groupId : msgData.userId;
    try {
      let output = '';
      const timeout = setTimeout(() => { output += '执行超时\n'; }, TIME_OUT);
      const result = await exec(cmd, { timeout: TIME_OUT, encoding: 'hex' });
      clearTimeout(timeout);
      this.cqnode.api.sendMsg(msgData.messageType, id, `${output}ok: ${JSON.stringify({
        stdout: decode(result.stdout),
        stderr: decode(result.stderr),
      }, null, 2)}`);
    } catch (e) {
      this.cqnode.api.sendMsg(msgData.messageType, id, `err: code:${e.code}\ncmd:${e.cmd}\nstdout:${decode(e.stdout)}\nstderr:${decode(e.stderr)}`);
    }
  },
  auth: 100,
  description: '执行command命令: ~$exec (命令行内容)',
} as Command;
