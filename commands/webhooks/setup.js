const inquirer = require('inquirer');
const utils = require('./utils');

module.exports = program => program.
  command('webhook-setup').
  description('Enable listeners and set their secrets.').
  action(command); // We don't decorate this one

const command = (options) => {
  inquirer.prompt([{
    type: 'list',
    name: 'webhook',
    message: 'Configure webhooks for:',
    choices: [
      'Transifex',
      'Github',
      'Zapier (tbi)'
    ],
  }]).then(answer => setup(answer.webhook)).then(applySetup);
};

const setup = webhook => inquirer.prompt([
  {
    type: 'confirm',
    name: 'enabled',
    message: `Enable ${webhook}?`,
  },
  {
    type: 'input',
    name: 'secret',
    message: `Secret for ${webhook} (leave blank for no secret):`,
    when: answers => answers.enabled,
  }
]).then(answers => Object.assign({}, answers, { webhook }));

const applySetup = answers => {
  const conf = utils.getListenerConf();
  const webhook = answers.webhook.split(' ')[0].toLowerCase();
  conf[webhook].enabled = answers.enabled;
  conf[webhook].secret = answers.secret || false;
  utils.setListenerConf(conf);
  console.log('Run flow listen to start webhook listener');
};
