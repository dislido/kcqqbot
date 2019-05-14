import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

export default async function getImg(url: string, fname?: string, fpath = path.resolve(process.cwd(), 'img')) {
  const proto = (() => {
    if (url.startsWith('http:')) return http;
    if (url.startsWith('https:')) return https;
    return false;
  })();
  if (!proto) throw new Error(`protocol error: (http:|https:)${url}`);
  let filename = fname;
  if (!filename) {
    const extReg = /(\w+\.\w+)[^/]*$/.exec(url);
    filename = (extReg && extReg[1]) || `${Date.now()}.png`;
  }
  return new Promise<string>((resolve, reject) => proto.get(url, (res) => {
    res.setEncoding('binary');
    let imgData = '';
    res.on('data', (chunk) => {
      imgData += chunk;
    }).on('end', () => {
      fs.writeFileSync(path.resolve(fpath, filename!), imgData, 'binary');
      resolve(filename);
    }).on('error', reject);
  }).on('error', reject));
}
