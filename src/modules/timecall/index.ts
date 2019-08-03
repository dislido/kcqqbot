import * as schedule from 'node-schedule';
import * as CQNode from '@dislido/cqnode';
import * as timedata from './data/timecall.json';

type TimeDataName = 'kiyoshimo' | 'yamakaze' | 'tokitsukaze';

interface UseData {
  group: number;
  use: TimeDataName;
}

function fixTimeZone(hour: number, zone: number) {
  return (hour + zone) % 24;
}

module.exports = class TimeCall extends CQNode.Module {
  jobMap = new Map<string, schedule.Job>();
  hour: number;
  timeZone: number;
  timedata = timedata;
  use: TimeDataName | UseData[];
  constructor({ timeZone = 8, use }: { timeZone: number, use: TimeDataName | UseData[] }) {
    super({
      name: '报时',
      description: '报时功能',
      help: '整点报时模块 无命令',
      packageName: '@dislido/cqnode-module-timecall',
    });
    this.use = use;
    this.timeZone = timeZone;
    this.hour = ((new Date()).getUTCHours() + this.timeZone) % 24;
  }

  onRun() {
    const cqnode = this.cqnode;
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
    this.jobMap.set('exercise', schedule.scheduleJob(`30 ${fixTimeZone(17, this.timeZone)},${fixTimeZone(5, this.timeZone)} * * *`, () => {
      cqnode.api.groupRadio('半小时后演习刷新');
    }));
  }

  onStop() {
    this.jobMap.forEach(e => e.cancel());
  }
};
