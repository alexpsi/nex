const path = require('path');
const fs = require('fs');

const findRoot = function(start) {
  start = start || process.cwd();
  if (typeof start === 'string') {
    if (start[start.length - 1] !== path.sep) {
      start += path.sep;
    }
    start = start.split(path.sep);
  }
  if (!start.length) throw new Error('could not find tx project, did you init?');
  start.pop();
  var dir = start.join(path.sep);
  try {
    fs.statSync(path.join(dir, '.tx.yml'));
    return dir;
  } catch (e) {}
  return findRoot(start);
};

module.exports = findRoot;
