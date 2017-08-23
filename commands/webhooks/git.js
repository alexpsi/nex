const _ = require('lodash');
const execa = require('execa');
const utils = require('./utils.js');
const deco = require('../../utils/decorator');
const origin_re = /origin\t(git@github\.com:|https:\/\/github\.com\/)(.*).git \(push\)/m;

module.exports = program => program.
  command('webhook-git <target_file> [branches]').
  description('Executes the provided file whenever a Github webhook is fired for that branches. The contents of the webhook are passed to the script as environment variables prefixed with webhook__. \n').
  action(deco({ enhance: true }, command));

const command = (c, tx, log, target_file, branches, options) => {
  branches = (branches) ? branches.split(',') : ['master'];
  const c_l = utils.getListenerConf();
  // Retrieve github repository from shell and parse output
  const repo = origin_re.exec(execa.shellSync('git remote -v').stdout)[2];
  if (!repo) {
    log.error('Could not find github repo');
    return Promise.resolve();
  }
  c_l['github']['triggers'] = c_l['github']['triggers'] || {};
  var repo_entry = {};
  branches.map(branch => {
    repo_entry[branch] = `${process.cwd()}/${target_file}`;
  });
  console.log(repo_entry);
  c_l['github']['triggers'][repo] = repo_entry;
  utils.setListenerConf(c_l);
  log.info(
    `Added triggers for github webhooks for repository ${repo}. ` +
    `Restart your listener for changes to take effect.`
  );
  return Promise.resolve();
};

module.exports.command = command;
