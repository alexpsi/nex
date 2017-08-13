const path = require('path');
const { mkdir, cp, rm } = require('shelljs');
const basedir = process.cwd();
const fixtures = path.join(basedir, 'test', 'fixtures', 'openformats');

module.exports.create = (p_slug, fixture) => {
  const dir = path.join(basedir, 'test', '.tmp', p_slug);
  mkdir('-p', dir);
  cp(`${fixtures}/${fixture}/*`, dir);
  return dir;
};

module.exports.remove = (p_slug) => {
  rm('-rf', path.join(basedir, 'test', '.tmp', p_slug));
};

module.exports.replace = (b, a) => cp(a, b);
