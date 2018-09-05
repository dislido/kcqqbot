const CQNode = require('@dislido/cqnode');
const config = require('./config');

const cqnode = CQNode.createRobot(config);

console.log('start', cqnode);
