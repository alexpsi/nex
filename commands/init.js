const _ = require('lodash');
const deco = require('../utils/decorator');
const Listr = require('listr'); // For testing

module.exports = program => program.
  command('init <project_slug> <source> <target_languages>').
  description(' Create a project in Transifex and sync local directory.').
  option('-n, --name [name]', 'Project name').
  option('-d, --description [description]', 'Project description').
  option('-i, --i18n [i18n type]', 'I18n filetype').
  option(
    '-f, --file_filter [file filter template]',
    'File filter template, allowed tags <%- name %>, <%- lang_code %>, <%- ext %>, <%- dir %>'
  ).
  action(deco({ noCONF: true }, command));

const command = function(c, tx, log, project, source, target, opts) {
  c.set('main:host', tx.base_url); // Stored localy
  c.set('main:project', project); // Stored localy
  c.set('defs:i18n_type', opts.i18n); // Stored to project meta
  c.set('defs:file_filter',
    opts.file_filter || 'translations/<%- name %>.<%- lang %><%- ext %>'
  );
  // Create a project
  const tasks = new Listr([{
    title: `Created ${project} with ${source} as source language`,
    task: () => tx.projectCreate({
      name: opts.name || project,
      slug: project,
      private: true,
      description: opts.description || '',
      long_description: c.serializeManifest(),
      source_language_code: source,
    }),
  }, {
    title: 'Add target languages to project',
    task: () => new Listr(
      target.split(',').map(code => {
        console.log(c.get('username'));
        return {
          title: `Added ${code} as a target language`,
          task: () => tx.languageCreate(project, {
            language_code: code,
            coordinators: [c.get('username')],
          }),
        };
      })),
  }, {
    title: `Succesfully initialized project ${project}`,
    task: () => Promise.all([
      c.save(),
      c.exec('echo ".tx.yml" >> .gitignore')
    ]),
  }], { collapse: false, renderer: c.ListrRender });

  return tasks.run();
};

module.exports.command = command;
