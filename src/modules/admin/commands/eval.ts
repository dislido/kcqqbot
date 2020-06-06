import { Command } from "../admin-command";
import CQNode, { Module, CQAPI } from "@dislido/cqnode";

export default {
  exec(this: Module, js: string, { resp, msgData }) {
    // todo: console
    const console = {
      ...global.console,
    };
    // todo: proxyAPI
    const _API = this.cqnode.api;
    const API = new Proxy({}, {
      get: (_, handler) => {
        if (handler === 'group') {
          return new Proxy(_API, {
            get: (_, handler) => {
              const api = _API[handler as keyof CQAPI];
              if (api) {
                return api.bind(this, (<CQNode.CQEvent.GroupMessage>msgData).groupId);
              }
              return api;
            },
          });
        }
        return _API[handler as keyof CQAPI];
      },
    });
    const result = eval(js); // eslint-disable-line no-eval
    resp.reply(`done.\n执行结果：${result}`);
  },
  auth: 100,
  description: '运行js代码: ~$eval (代码内容)',
} as Command;
