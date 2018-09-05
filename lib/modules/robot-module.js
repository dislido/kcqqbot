class RobotModule {
  constructor(config) {
    Object.assign(this, config);
    this.inf = Object.assign({
      name: '空模块',
      description: '无描述信息',
      help: '无帮助信息',
      // 消息处理顺序,不拦截消息的模块设置为-Infinity,不处理消息的模块设置为Infinity
      // 通常触发条件越严格的模块index值越小
      index: Infinity,
    }, config.inf);
  }
  run() {
    console.log(`${this.inf.name} run`);
  }
  stop() {
    console.log(`${this.inf.name} stop`);
  }
  filter(/* data */) {
    console.error(`${this.inf.name} has no filter`);
    return false;
  }
}

module.exports = RobotModule;
