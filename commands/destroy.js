const deco = require('../utils/decorator');

module.exports = program => program.
  command('destroy <project_slug>').
  // project_slug: The project's slug at Transifex. **(required)**
  description('Delete a project from Transifex').
  action(deco({stat: true}, command));

const command = function(conf, tx, log, project_slug, opts) {
  if (project_slug.length < 3) {
    return Promise.reject(`something fishy ${typeof project_slug}`);
  }
  log.info(`Deleting project with slug: ${project_slug}`);
  return tx.projectDelete(project_slug);
};

module.exports.command = command;
