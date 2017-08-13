const deco = require('../utils/decorator');

module.exports = program => program.
  command('translate <file> <lang_code> <source_string> <translation>').
  description([
    'Adds a translation <translation> for <source_string> in the resource',
    ' that matches <file>'
  ]).
  action(deco({ enhance: true }, command));

const command = function(conf, tx, log, file, lang_code, source_string, translation, options) {
  return tx.translationStringUpdate(
    conf.get('main:project'),
    `${conf.branch}-${conf.hash(file)}`,
    lang_code,
    source_string,
    { translation }
  ).then(() => ({ status: 'OK' }));
};

module.exports.command = command;
