const express = require('express');
const GitHandler = require('github-webhook-handler');
const txHandler = require('./listeners/transifex.js');
const winston = require('winston');
const expressWinston = require('express-winston');

const log = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({'timestamp': true, 'colorize': true, 'json': true})
  ],
});

module.exports = program => program.
  command('webhook-listen [port]').
  description(' Starts listening for webhooks and executes triggers.').
  action(command);

const command = (port = 3000, options) => {
  const app = express();
  const gitHandler = GitHandler({
    path: '/github',
    secret: '12345',
  });
  app.use(expressWinston.logger({winstonInstance: log}));
  app.use(gitHandler);

  app.use(txHandler({
    path: '/transifex',
    secret: '12345',
    cb: data => {
      log.info(data);
    },
  }));

  gitHandler.on('push', function(event) {
    log.info('GITHUB');
    log.info(event.payload.repository);
  });
  gitHandler.on('error', err => log.error(err.message));

  app.use(expressWinston.errorLogger({winstonInstance: log}));

  app.listen(port, function() {
    log.info(`Listening on port ${port}`);
  });
};

module.exports.command = command;
