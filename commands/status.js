const _ = require('lodash');
const deco = require('../utils/decorator');
const {prepareTree, mapLeaves} = require('../utils/treeview.js');
const c = require('chalk');
const archy = require('archy');
const fsp = require('fs-promise');

module.exports = program => program.
  command('status').
  description('Shows status of local project').
  option('-j, --json', 'output to JSON').
  action(deco({ enhance: true }, command));

const command = (conf, tx, log, opts) =>
  (opts.json) ? toJson(conf, tx, log, opts) : toStdout(conf, tx, log, opts);

const toJson = function(conf, tx, log, opts) {
  console.log(JSON.stringify(conf.toJSON()));
  return Promise.resolve();
};

const toStdout = function(conf, tx, log, opts) {
  console.log(`${c.white.bold(conf.get('main:project'))}@${c.white.italic(conf.branch)}`);
  console.log(`\n${conf.get('project:description')}\n`);

  const stagedFiles = conf.getStagedFiles();
  const trackedFiles = conf.getTrackedFiles();

  let changed = [];
  return Promise.all(trackedFiles.map(entry => {
    return conf.getFile(entry).
      then(fp => fsp.readFile(fp)).
      then((file) => {
        if (conf.hash(file.toString()) !== entry.c_hash) {
          changed.push(entry.filepath);
        }
      });
  })).
    then(() => tx.languages(conf.get('main:project'))).
    then((res) => {
      console.log(
        `${c.white.bold('Source language:')}`,
        conf.get('project:source_language_code'),
        `${c.white.bold('Target languages:')}`,
        res.data.map(d => d.language_code).join(','),
        '\n'
      );
      if (stagedFiles.length > 0) {
        console.log(
          archy(prepareTree(stagedFiles, c.white.bold('Staged files')))
        );
      }
      if (trackedFiles.length > 0) {
        console.log(archy(mapLeaves(
          prepareTree(trackedFiles, c.white.bold('Tracked files')),
          (node, filepath) => {
            if (_.some(changed, fp => _.endsWith(filepath, fp))) {
              node.label += ` ${c.red('Changed')}`;
            }
            return node;
          },
          'Tracked files'
        )));
      } else {
        console.log('No tracked files');
      }
    });
};
module.exports.command = command;
