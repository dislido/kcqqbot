import * as vm from 'vm';
import * as babel from '@babel/core';
import * as CQNode from '@dislido/cqnode';
import babelConfig from './babel-config';

export default module.exports = class JSVM extends CQNode.Module {
  context: {
    global?: any;
    console: any;
    save2ctx(obj: any): boolean;
    [name: string]: any;
  }
  constructor() {
    super({
      name: 'js虚拟机',
      description: '运行js代码',
      help: `js (code)
  code: js代码
  在console.log中输出的信息会添加到回复中
  代码运行时间不能超过1s
  支持es6+和stage 2语法`,
      packageName: '@dislido/cqnode-module-jsvm',
    });
    this.context = {
      console: null,
      save2ctx(obj) {
        const ctx = Object.entries(obj);
        const failNames: string[] = [];
        ctx.forEach(([name, item]) => {
          if (Reflect.has(this.context, name)) return failNames.push(name);
          this[name] = item;
          return true;
        });
        if (failNames.length) throw new Error(`${failNames} 名称已被占用`);
        return true;
      },
    };

    this.context.global = this.context;
    this.context.save2ctx.toString = () => 'function save2ctx() { [hidden code] }';
  }
  onMessage({ atme, msg }: CQNode.CQEvent.Message, resp: CQNode.CQResponse.Message) {
    if (!atme) return false;
    if (msg.startsWith('js ')) {
      const firstLine = msg.split('\n', 1)[0];
      const params = firstLine.slice(2).trim().split(/\s+/);
      const jsCode = msg.slice(firstLine.length);
      return resp.reply(this.runCode(jsCode, params), true);
    }
    return false;
  }
  runCode(js: string, params: string[] = []) {
    let err;
    let result = '';
    let extra = '';
    try {
      const transformResult = babel.transformSync(js, babelConfig);
      const code = transformResult ? transformResult.code : null;
      const ctxGlobal = {
        ...this.context,
        console: {
          log(...msg: any[]) {
            let add = msg.join(' ');
            if (add === undefined) add = 'undefined';
            else if (add === null) add = 'null';
            result += add;
            result += '\r\n';
          },
        },
      };
      ctxGlobal.console.log.toString = () => 'function log() { [native code] }';
      const ctx = vm.createContext(ctxGlobal);
      extra = `\n>> ${(new vm.Script(`${code}`)).runInContext(ctx, { timeout: 1000 })}`;
    } catch (e) {
      err = e;
      console.log(e);
    }
    if (err) result = `${err.name}: ${err.message}`;
    if (result.length > 300) {
      result = `输出内容过长(限制300个字符)，超出部分已省略：
  ${result.slice(0, 300)}...`;
    }
    return `js运行结果：
  ${result}${extra}`;
  }
};
