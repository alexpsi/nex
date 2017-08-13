const _ = require('lodash');
const path = require('path');
const fsp = require('fs-promise');
const mkdirp = require('mkdirp');

module.exports = (filepath, file_filter, lang_code, content, merge) => {
  filepath = _.template(file_filter)(_.extend(
    path.parse(filepath),
    { lang: lang_code }
  ));
  mkdirp.sync(path.dirname(filepath));
  return fsp.writeFile(filepath, content);
};
