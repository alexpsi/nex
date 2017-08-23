const express = require('express');
const GitHandler = require('github-webhook-handler');
const txHandler = require('./listeners/transifex.js');
const genericHandler = require('./listeners/generic.js');

const winston = require('winston');
const expressWinston = require('express-winston');
const utils = require('./utils.js');

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp': true, 'colorize': true})
  ],
});

const onHook = (hook_type, payload) => {

};

module.exports = program => program.
  command('webhook-listen [port]').
  description(' Starts listening for webhooks and executes triggers.').
  action(command);

const command = (port = 3000, options) => {
  const app = express();
  const c_l = utils.getListenerConf();

  app.use(expressWinston.logger({winstonInstance: log}));

  if (c_l.transifex.enabled) {
    app.use(txHandler({
      path: '/transifex',
      secret: c_l.transifex.secret,
      cb: data => {
        log.info('Received Transifex webhook');
        onHook('transifex', data);
      },
    }));
  }
  if (c_l.github.enabled) {
    const gitHandler = GitHandler({
      path: '/github',
      secret: c_l.github.secret,
    });
    app.use(gitHandler);
    gitHandler.on('push', function(event) {
      log.info('Received Github webhook');
      onHook('github', event.payload);
    });
    gitHandler.on('error', err => log.error(err.message));
  }

  if (c_l.generic.enabled) {
    app.use(genericHandler({
      path: '/generic',
      secret: c_l.generic.secret,
      cb: data => {
        log.info('Received Generic webhook');
        onHook('generic', data);
      },
    }));
  }
  app.use(expressWinston.errorLogger({ winstonInstance: log }));

  app.listen(port, () => log.info(`Listening on port ${port}`));
};

module.exports.command = command;
