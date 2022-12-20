const fs = require('fs/promises');
const path = require('path');

async function saveToken(qq) {
  const data = await fs.readFile(path.resolve(process.cwd(), `.cqnode/oicq/${qq}/token`));
  const dataBuf = [...data];
  await fs.writeFile(path.resolve(process.cwd(), `.cqnode/oicq/${qq}/token.js`), `
const fs = require('fs/promises');
const path = require('path');

async function loadToken() {
  const dataBuf = [${dataBuf.join(',')}];
  await fs.writeFile(path.resolve(process.cwd(), '.cqnode/oicq/${qq}/token'), Buffer.from(dataBuf))
}

loadToken()
`);
  console.log('保存完成');
}

process.stdin.once('data', qq => {
  const qqStr = String(qq).trim();
  console.log(`保存token:<${qqStr}>`);
  saveToken(qqStr);
});
