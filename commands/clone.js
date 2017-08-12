const deco = require('../utils/decorator');

module.exports = program => program.
  command('clone <project_slug>').
  description(' Create a local repo from an existing TX project.').
  action(deco({ noCONF: true }, command));

const command = function(c, tx, log, project, opts) {
  c.set('main:host', tx.base_url);
  c.set('main:project', project);
  return c.enhanceFromTX(project).then(() => Promise.all([
    c.save(),
    c.exec('echo ".tx.yml" >> .gitignore')
  ])).then(() => {
    log.info(`Succesfully cloned project ${project}`);
  });
};

module.exports.command = command;
