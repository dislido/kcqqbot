
// module.exports = class SendImageMsgPlugin {
//   /**
//    * @param {Object} config
//    * @param {string} config.path CQ image文件夹地址
//    * @param {string} config.group 目标群
//    */
//   constructor(config) {
//     this.config = config;
//   }
//   // [CQ:image,file=F7178BE522EFE32FC4155283C52DE834.jpg]
//   beforeSendMessage(msgObj) {
//     if (msgObj.to !== this.config.group) return msgObj;
//     const msg = msgObj.msg;
//     return msgObj;
//   }
// };
