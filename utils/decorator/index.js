const _ = require('lodash');
const fs = require('fs');
const C = require('../c');

const getROOT = require('./getROOT.js');
const getTX = require('./getTX.js');
const Logger = require('winston');
Logger.cli();
Logger.level = 'info';
const catcher = require('./catcher.js')(Logger);

module.exports = (deco_opts, cmd) => (...args) => {
  let options = _.extend(deco_opts, args.pop());
  if (options.noCONF && fs.existsSync('.tx.yml')) {
    Logger.error('.tx.yml already exists.');
    process.exit();
  }
  const root = (options.noCONF) ? process.cwd() : getROOT();
  const conf = new C(root, options);

  const tx = getTX(conf, options);
  conf.tx = tx; // EVIL
  global._conf = conf; // for testing
  return ((options.enhance) ? conf.enhanceFromTX() : Promise.resolve()).then(
    () => {
      if (options.test) return cmd(conf, tx, Logger, ...args, options);
      return cmd(conf, tx, Logger, ...args, options).catch(catcher);
    }
  );
};
