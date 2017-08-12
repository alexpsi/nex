const program = require('commander');
const Logger = require('winston');
global._ = require('lodash');
Logger.level = 'info';
program.log = Logger;
program.version(require('./package.json').version);

// Top level program object exposes options to all subcommands
program.
  option('-h, --host [hostname]', 'Specify the transifex server', 'https://www.transifex.com').
  option('-u, --user [username]', 'Specify the username').
  option('-p, --pass [password]', 'Specify the password').
  option('-t, --token [token]', 'Specify the transifex token').
  option('-j, --json', 'Output JSON');

// Commands
require('./commands/login.js')(program);
require('./commands/init.js')(program);
require('./commands/clone.js')(program);

program.on('--help', () => {
  program.log.info(require('chalk').white.bold(`
    EXPERIMENTAL BUILD
  `));
});

module.exports = program;
