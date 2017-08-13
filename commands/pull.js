const _ = require('lodash');
const Listr = require('listr');
const deco = require('../utils/decorator');
const fileFilter = require('../utils/fileFilter.js');

module.exports = program => program.
  command('pull [lang_codes] [fname]').
  description([
    ' Pull translations from Transifex and create translation',
    ' files via file filter'
  ]).
  option(
    '-e, --extend [branch]',
    'Name of the parent branch that you want to extend upon'
  ).action(deco({enhance: true}, (c, tx, log, lcs, filename, options) => {
    if (options.extend) {
      return command(c, tx, log, lcs, filename, _.extend(options, {
        branch: options.extend,
      })).then(() => command(c, tx, log, lcs, filename, _.extend(options, {
        branch: c.branch,
        merge: true,
      })));
    }
    return command(c, tx, log, lcs, filename, options);
  }));

const command = (c, tx, log, lcs, filename, options) => {
  options.branch = options.branch || c.branch;
  options.merge = options.merge || false;
  lcs = (lcs && lcs != 'all') ? lcs.split(',') : [];
  let trackedFiles = c.getTrackedFiles(options.branch);
  if (filename) {
    filename = c.fromTXRoot(filename);
    trackedFiles = _.filter(trackedFiles, { filepath: filename });
  }
  const getLangs = (lcs) => {
    if (lcs.length == 0) {
      return tx.languages(c.get('main:project')).
        then(r => _.map(r.data, 'language_code'));
    }
    return Promise.resolve(lcs);
  };

  return getLangs(lcs).then(lang_codes =>
    (new Listr(_.flatten(trackedFiles.map(entry => [{
      title: `Pulling source file for ${entry.filepath}`,
      task: () => pullSource(c, tx, options.branch, entry),
    }, {
      title: `${entry.filepath}`,
      task: () => new Listr(lang_codes.map(lc => {
        return {
          title: `Pulling ${lc} translations`,
          task: () => pullFile(c, tx, options.branch, lc, entry),
        };
      })),
    }])), {
      concurrent: c.get('global:max_concurrency'),
      collapse: false,
      renderer: c.ListrRender,
    })).run()
  ).catch(console.log);
};

const pullSource = (c, tx, branch, entry) => tx.resourceFile(
  entry.project || c.get('main:project'),
  `${branch}-${entry.slug}`
).then(data => fileFilter(
  entry.filepath,
  entry.file_filter || c.get('defs:file_filter'),
  c.get('project:source_language_code'),
  data.data
));

const pullFile = (c, tx, branch, lang_code, entry) => tx.translationFile(
  entry.project || c.get('main:project'),
  `${branch}-${entry.slug}`,
  lang_code,
  entry.i18n_type || c.get('defs:i18n_type')
).then(data => fileFilter(
  entry.filepath,
  entry.file_filter || c.get('defs:file_filter'),
  lang_code,
  data.data
));

module.exports.command = command;
