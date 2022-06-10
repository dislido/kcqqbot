import vm from 'vm';
import { CQEventType, FunctionModule } from '@dislido/cqnode';

const JSVM: FunctionModule = mod => {
  const context: any = {
    console: null,
    save2ctx(obj: any) {
      const ctx = Object.entries(obj);
      const failNames: string[] = [];
      ctx.forEach(([name, item]) => {
        if (context[name]) return failNames.push(name);
        this[name] = item;
        return true;
      });
      if (failNames.length) throw new Error(`${failNames} 名称已被占用`);
      return true;
    },
  };

  // todo params
  const runCode = (js: string, _params: string[] = []) => {
    let err;
    let result = '';
    let extra = '';
    try {
      const ctxGlobal = {
        ...context,
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
      extra = `\n>> ${(new vm.Script(`${js}`)).runInContext(ctx, { timeout: 1000 })}`;
    } catch (e) {
      err = e;
      console.log(e);
    }
    if (err) result = `${err.name}: ${err.message}`;
    if (result.length > 300) {
      result = `输出内容过长(限制300个字符)，超出部分已省略：
  ${result.slice(0, 300)}...`;
    }
    return `js运行结果：\n${result}${extra}`;
  };

  mod.on(CQEventType.message, ctx => {
    if (/^js/.test(ctx.textMessage)) {
      const firstLine = ctx.textMessage.split('\n', 1)[0];
      const params = firstLine.slice(2).trim().split(/\s+/);
      const jsCode = ctx.textMessage.slice(firstLine.length);
      return ctx.reply(runCode(jsCode, params), true);
    }
    return false;
  });

  return {
    name: 'js虚拟机',
    description: '运行js代码',
    help: `
------
js
code
------
code: js代码
在console.log中输出的信息会添加到回复中
代码运行时间不能超过1s`,
    packageName: '@dislido/cqnode-module-jsvm',
  };
};

export default JSVM;
