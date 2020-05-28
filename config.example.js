const Help = require('./dist/modules/help');
const KcTwitter = require('./dist/modules/kc-twitter');
const JSVM = require('./dist/modules/jsvm');
const ChatHistory = require('./dist/modules/chat-history');
const Notify = require('./dist/modules/notify');
const Repeat = require('./dist/modules/repeat');
const TimeCall = require('./dist/modules/timecall');
const Tuling = require('./dist/modules/tuling');
const KanBirthday = require('./dist/modules/kan-birthday');
const Misc = require('./dist/modules/misc');
const Admin = require('./dist/modules/admin');
const GroupBackup = require('./dist/modules/group-backup');
const ReceiveGroupRequest = require('./dist/modules/receive-group-request');

const MsgTail = require('./dist/plugins/msg-tail');
const ModuleCommand = require('./dist/plugins/module-command');

const config = {
  admin: [1145141919],
  modules: [
    new Admin(),
    new Help(),
    new KcTwitter(),
    new JSVM(),
    new ChatHistory(20),
    new Notify(),
    new Repeat(),
    new TimeCall({
      use: [
        { group: 810, use: 'kiyoshimo' },
      ],
    }),
    new KanBirthday({}),
    new GroupBackup(),
    new Misc(),
    new Tuling({ apikey: '1234567890abcdef' }),
    new ReceiveGroupRequest(),
  ],
  plugins: [
    // new MsgTail('\n from CQNode'),
	  // new ModuleCommand(),
  ],
  prompt: true,
};

module.exports = config;