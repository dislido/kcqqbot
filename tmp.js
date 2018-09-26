const exec = require('child_process').exec;
const iconv = require('iconv-lite');

const decode = (hexStr) => {
  const arr = [...hexStr].reduce((obj, curr) => {
    obj.next = !obj.next;
    if (obj.next) {
      obj.arr.push([curr]);
    } else {
      obj.arr[obj.arr.length - 1].push(curr);
    }
    return obj;
  }, { arr: [], next: false })
  .arr
  .map(it => parseInt(it.join(''), 16));
  return iconv.decode(Buffer.from(arr), 'GBK');
};

exec('dir', { encoding: 'hex' }, (e, r) => {
  console.log(decode(r), 'GBK');
});
