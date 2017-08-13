const deco = require('../../utils/decorator');
const init = require('../../commands/init.js').command;
const status = require('../../commands/status.js').command;
const clone = require('../../commands/clone.js').command;
const add = require('../../commands/add.js').command;
const push = require('../../commands/push.js').command;
const destroy = require('../../commands/destroy.js').command;

// const pull = require('../../commands/pull.js').command;

const Listr = require('listr');
const credentials = require('./credentials.js');

module.exports.init = deco({
  Listr,
  test: true,
  noCONF: true,
  parent: credentials,
  host: credentials.host,
}, init);

module.exports.status = deco({
  test: true,
  parent: credentials,
  host: credentials.host,
}, status);

module.exports.clone = deco({
  test: true,
  noCONF: true,
  parent: credentials,
  host: credentials.host,
}, clone);

module.exports.add = deco({
  test: true,
  enhance: true,
  parent: credentials,
  host: credentials.host,
}, add);

module.exports.push = deco({
  test: true,
  enhance: true,
  parent: credentials,
}, push);

module.exports.destroy = deco({
  test: true,
  stat: true,
  parent: credentials,
}, destroy);
