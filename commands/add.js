const _ = require('lodash');
const deco = require('../utils/decorator');
const fileTypes = require('../utils/file-types');

module.exports = program => program.
  command('add [filenames...]').
  option('-i, --i18n [i18n type]', 'I18n filetype').
  option(
    '-f, --file_filter [file filter template]',
    'File filter template, allowed tags <%- name %>, <%- lang_code %>, <%- ext %>, <%- dir %>'
  ).
  description(' Starts tracking a filename, and creates a new resource in Transifex with the contents of the file\n').
  action(deco({ enhance: true }, command));

const command = (c, tx, log, filenames, options) => {
  options.i18n = options.i18n || c.get('defs:i18n_type');
  if (!options.i18n) return Promise.reject('Missing i18n type');
  _.chain(filenames).
    map(f => c.fromTXRoot(f)).
    filter(filename => {
      if (!c.fileExists(filename)) {
        log.error(filename, ':File does not exist');
        return false;
      }
      if (options.i18n && !fileTypes.getI18n(options.i18n)) {
        log.error(filename, ':Unknown i18n type');
        return false;
      }
      if (c.isFileStaged(filename)) {
        log.error(filename, ':File already staged');
        return false;
      }
      if (c.isFileTracked(filename)) {
        log.error(filename, ':File already tracked');
        return false;
      }
      return true;
    }).each(filename => {
      c.addToStaging({
        filepath: filename,
        i18n_type: options.i18n,
        file_filter: options.file_filter,
      });
      log.info(`Staged ${filename}`);
    }).value();
  return c.save();
};

module.exports.command = command;
