const vm = require('vm');
const babel = require('@babel/core');
const CQNode = require('@dislido/cqnode');
const babelConfig = require('./babel-config.json');

function decodeHtml(str) {
  const s = str.replace(/&#[\dA-F]{2,4};/g, hex => String.fromCharCode(`0${hex.slice(2, -1)}`));
  return s.replace(/&amp;/g, '&');
}

module.exports = class JSVM extends CQNode.Module {
  constructor() {
    super();
    this.inf = {
      name: 'js虚拟机',
      description: '运行js代码',
      help: `js (code)
  code: js代码
  可以在console.log中输出信息
  代码运行时间不能超过1s
  支持es6+和stage 2语法`,
    };
    this.context = {
      console: null,
      save2ctx(obj) {
        const ctx = Object.entries(obj);
        const failNames = [];
        ctx.forEach(([name, item]) => {
          if (Reflect.has(this.context, name)) return failNames.push(name);
          this.context[name] = item;
          return true;
        });
        if (failNames.length) throw new Error(`${failNames} 名称已被占用`);
        return true;
      },
    };

    this.context.global = this.context;
    this.context.save2ctx.toString = () => 'function save2ctx() { [hidden code] }';
  }
  onMessage({ atme, msg }, resp) {
    if (!atme) return false;
    if (msg.trim().startsWith('js')) {
      resp.send(this.runCode(msg.trim().slice(2)), true);
      return true;
    }
    return false;
  }
  runCode(js) {
    let err;
    let result = '';
    let extra = '';
    try {
      const runjs = babel.transform(decodeHtml(js), babelConfig).code;
      const ctxGlobal = {
        ...this.context,
        console: {
          log(...msg) {
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
      extra = `\n>> ${(new vm.Script(runjs)).runInContext(ctx, { timeout: 1000 })}`;
    } catch (e) {
      err = e;
      console.log(e);
    }
    if (err) result = `${err.name}: ${err.message}`;
    if (result.length > 300) {
      result = `输出内容过长(限制300个字符)，超出部分已省略：
  ${result.slice(0, 300)}...`;
    }
    if (result.split('\n') > 10) {
      result = `输出行数过多，已转义换行符为\\n：
  ${result.split('\n').join('\\n')}`;
    }
    return `js运行结果：
  ${result}${extra}`;
  }
};
