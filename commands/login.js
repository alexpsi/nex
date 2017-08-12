const inquirer = require('inquirer');
const _ = require('lodash');
const os = require('os');
const path = require('path');
const ini = require('../utils/ini.js');
const chalk = require('chalk');

const hostnameAndType = [{
  type: 'input',
  name: 'hostname',
  message: 'Transifex instance:',
  default: 'https://www.transifex.com',
}, {
  type: 'list',
  name: 'auth_type',
  message: 'Authentication method?',
  choices: ['Token', 'Username and Password'],
}];

const tP = [{
  type: 'input',
  name: 'user',
  message: 'Username (required to create a project):',
  required: false,
}, {
  type: 'input',
  name: 'token',
  message: 'API Token:',
  required: true,
}];

const pP = [{
  type: 'input',
  name: 'user',
  message: 'Username:',
  required: true,
}, {
  type: 'password',
  name: 'pass',
  message: 'Password:',
  required: true,
}];

const authenticationPrompt = () => inquirer.prompt(hostnameAndType).
  then(hat => inquirer.prompt((hat.auth_type == 'Token') ? tP : pP).
    then(creds => _.extend(creds, hat))
  );

module.exports = program => program.
  command('login').
  description(' Login to Transifex and create credentials file\n').
  action(command); // We don't decorate this one

const command = function(options) {
  let rc;
  let rc_path = path.join(os.homedir(), '.transifexrc');
  try { rc = ini.read(rc_path); } catch (e) { rc = {}; }
  console.log(chalk.white.bold(`
 _____                    _  __
|_   _| __ __ _ _ __  ___(_)/ _| _____  __
  | || '__/ _' | '_ \\/ __| | |_ / _ \\ \\/ /
  | || | | (_| | | | \\__ \\ |  _|  __/>  <
  |_||_|  \\__,_|_| |_|___/_|_|  \\___/_/\\_\\`));
  console.log(chalk.white.bold(`\nTransifex Flow CLI L10n and Automation`));
  authenticationPrompt().then(creds => {
    rc[creds.hostname] = _.omitBy({
      username: creds.user,
      password: creds.pass,
      token: creds.token,
    }, _.isUndefined);
    return ini.write(rc_path, rc);
  });
};
