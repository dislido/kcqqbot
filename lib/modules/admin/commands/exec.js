
const util = require('util');
const childProcess = require('child_process');
const iconv = require('iconv-lite');

const exec = util.promisify(childProcess.exec);

const decode = (hexStr) => {
  const arr = [...hexStr].reduce((obj, curr) => {
    obj.next = !obj.next;
    if (obj.next) {
      obj.arr.push([curr]);
    } else {
      obj.arr[obj.arr.length - 1].push(curr);
    }
    return obj;
  }, { arr: [], next: false })
  .arr
  .map(it => parseInt(it.join(''), 16));
  return iconv.decode(Buffer.from(arr), 'GBK');
};

const TIME_OUT = 10000;

module.exports = {
  async exec(cmd, { resp }) {
    try {
      let output = '';
      const timeout = setTimeout(() => { output += '执行超时\n'; }, TIME_OUT);
      const result = await exec(cmd, { timeout: TIME_OUT, encoding: 'hex' });
      clearTimeout(timeout);
      resp.send(`${output}ok: ${JSON.stringify({
        stdout: decode(result.stdout),
        stderr: decode(result.stderr),
      }, null, 2)}`);
    } catch (e) {
      resp.send(`err: code:${e.code}\ncmd:${e.cmd}\nstdout:${decode(e.stdout)}\nstderr:${decode(e.stderr)}`);
    }
  },
  auth: 100,
  description: '执行command命令: ~$exec (命令行内容)',
};
