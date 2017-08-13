const _ = require('lodash');
const fs = require('fs');
const store = require('./store.js');
const path = require('path');
const yaml = require('js-yaml');
const execa = require('execa');
const fsp = require('fs-promise');
const globs = require(path.join('..', '..', 'globals.json'));
const shorthash = require('shorthash').unique;
const mockRenderer = require('../../test/helpers/mockRenderer.js');

class Conf {
  constructor(root, options) {
    // Retrieve git branch name if inside a repo or return master
    try {
      this.branch = execa.shellSync('git rev-parse --abbrev-ref HEAD').stdout;
    } catch (e) {
      this.branch = 'master';
    }
    // Throw error if in detached head state or empty repo
    if (this.branch == 'HEAD') throw new Error('Empty git repository');
    // Expose exec as a command to the conf object (SYNC)
    this.exec = execa.shell;
    // Used for monkeypatching the listr renderer when testing
    this.ListrRender = (options.test) ? mockRenderer : 'default';
    // Merge global conf in conf object
    this.tx_root = root;
    this.store = store;
    this.get = store.get;
    this.set = store.set;
    let local;
    try {
      local = yaml.safeLoad(
        fs.readFileSync(path.join(root, '.tx.yml'), 'utf8')
      );
    } catch (e) { local = {}; }
    if (local.main) store.set('main', local.main);
    if (local.staged) store.set('staged', local.staged);
    _.each(_.keys(globs), (g) => store.set('global:' + g, globs[g]));
  }

  hash(p) { return shorthash(p); }
  hashFile(p) { return shorthash(fs.readFileSync(p).toString()); }

  save() {
    return fsp.writeFile(
      path.join(this.tx_root, '.tx.yml'),
      yaml.safeDump(_.omitBy({
        main: store.get('main'),
        staged: store.get('staged'),
      }, _.isUndefined))
    );
  }

  toJSON() {
    return {
      tracked: this.getTrackedFiles(),
      staged: this.getStagedFiles(),
      branches: _.omitBy(this.get('branches'), _.isUndefined),
      defs: _.omitBy(this.get('defs'), _.isUndefined),
    };
  }

  enhanceFromTX(p) {
    let that = this;
    return this.tx.project(p || this.get('main:project')).then(res => {
      // WOOHOO
      this.set('project', res.data);
      let manifest = yaml.safeLoad(res.data.long_description);
      if (manifest) {
        that.set('defs', manifest.defs || {});
        that.set('branches', manifest.branches || {});
      }
      return Promise.resolve();
    });
  }

  getHash(entry) {
    return shorthash(entry.filepath);
  }

  updateTX(p) {
    return this.tx.projectUpdate(p || this.get('main:project'), {
      long_description: this.serializeManifest(),
    });
  }

  serializeManifest() {
    return yaml.safeDump({
      branches: _.omitBy(this.get('branches'), _.isUndefined),
      defs: _.omitBy(this.get('defs'), _.isUndefined),
    });
  }

  getStagedFiles() {
    return _.transform(
      this.get('staged'),
      (r, f, i) => r.push(_.extend(f, {slug: i})),
      []
    );
  }

  getStaged(hash) {
    return this.get(`staged:${hash}`);
  }

  addToStaging(entry) {
    entry = _.omitBy(entry, _.isUndefined);
    this.set(`staged:${this.getHash(entry)}`, entry);
  }

  removeFromStaging(entry) {
    this.set('staged', _.omit(this.get('staged'), this.getHash(entry)));
  }

  getTrackedFiles(branch) {
    branch = branch || this.branch;
    return _.transform(
      this.get(`branches:${branch}`),
      (r, f, i) => r.push(_.extend(f, {slug: i})),
      []
    );
  }

  getTracked(hash) {
    return this.get(`branches:${this.branch}:${hash}`);
  }

  addToTracking(entry) {
    entry = _.omitBy(entry, _.isUndefined);
    this.set(`branches:${this.branch}:${this.getHash(entry)}`, entry);
  }

  fromTXRoot(p) {
    return path.relative(this.tx_root, path.join(process.cwd(), p));
  }

  fileExists(p) {
    return fs.existsSync(path.join(this.tx_root, p));
  }

  isFileTracked(p) {
    return this.get(`branches:${this.branch}:${this.hash(p)}`);
  }

  isFileStaged(p) {
    return this.get(`staged:${this.hash(p)}`);
  }

  getFile(e) {
    return Promise.resolve(path.join(this.tx_root, e.filepath));
  }
}

module.exports = Conf;
