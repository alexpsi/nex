const filetypes = require('./filetypes.json');
const _ = require('lodash');

module.exports.extToI18n = ext =>
  _.filter(filetypes, f => f.ext.indexOf(ext) !== -1);

module.exports.getI18n = i18n_type => _.find(filetypes, { i18n_type });
