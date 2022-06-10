import Setu from '../modules/setu';

const mod: any = {
  on(_en: any, fn: any) {
    fn({
      textMessage: '色图',
      reply(data: any) {
        console.log(data);
      },
    });
  },
};
Setu(mod);
