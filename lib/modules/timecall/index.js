const timedata = require('./data/timecall.json');
const schedule = require('node-schedule');
const CQNode = require('@dislido/cqnode');

const { bindingCQNode } = CQNode.Module.symbols;

module.exports = class TimeCall extends CQNode.Module {
  constructor({ use, sendGroups }) {
    super();
    this.inf = {
      name: '报时',
      description: '报时功能',
      help: '整点报时模块 无命令',
    };
    this.jobMap = new Map();
    this.hour = (new Date()).getHours();
    this.timedata = timedata;
    this.use = use;
    this.sendGroups = sendGroups;
  }
  onRun() {
    const cqnode = this[bindingCQNode];
    if (!this.sendGroups) this.sendGroups = cqnode.config.listenGroups;
    this.jobMap.set('timecall', schedule.scheduleJob('0 0 * * * *', () => {
      if (typeof this.use === 'string') {
        cqnode.utils.radio(this.timedata[this.use][(++this.hour) % 24], this.sendGroups);
      } else {
        ++this.hour;
        this.use.forEach(({ group, use }) => {
          cqnode.utils.send(this.timedata[use][(this.hour) % 24], 101, group);
        });
      }
    }));
    this.jobMap.set('exercise', schedule.scheduleJob('30 1,13 * * *', () => {
      cqnode.utils.radio('半小时后演习刷新', this.sendGroups);
    }));
  }
  onStop() {
    this.jobMap.forEach(e => e.cancel());
  }
};
