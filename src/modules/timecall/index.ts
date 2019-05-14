import * as schedule from 'node-schedule';
import * as CQNode from '@dislido/cqnode';
import * as timedata from './data/timecall.json';

type TimeDataName = 'kiyoshimo' | 'yamakaze' | 'tokitsukaze';

interface UseData {
  group: number;
  use: TimeDataName;
}

module.exports = class TimeCall extends CQNode.Module {
  jobMap = new Map<string, schedule.Job>();
  hour = (new Date()).getHours();
  timedata = timedata;
  use: TimeDataName | UseData[];
  constructor({ use }: { use: TimeDataName | UseData[] }) {
    super({
      name: '报时',
      description: '报时功能',
      help: '整点报时模块 无命令',
      packageName: '@dislido/cqnode-module-timecall',
    });
    this.use = use;
  }

  onRun() {
    const cqnode = this.bindingCQNode;
    this.jobMap.set('timecall', schedule.scheduleJob('0 0 * * * *', () => {
      if (typeof this.use === 'string') {
        cqnode.api.groupRadio(this.timedata[this.use][(++this.hour) % 24]);
      } else {
        ++this.hour;
        this.use.forEach(({ group, use }) => {
          cqnode.api.sendGroupMsg(group, this.timedata[use][(this.hour) % 24]);
        });
      }
    }));
    this.jobMap.set('exercise', schedule.scheduleJob('30 1,13 * * *', () => {
      cqnode.api.groupRadio('半小时后演习刷新');
    }));
  }

  onStop() {
    this.jobMap.forEach(e => e.cancel());
  }
};
